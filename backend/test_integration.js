require("dotenv").config();
const assert = require("assert");
const app = require("./src/app");
const { analyzeSymptoms } = require("./src/services/geminiService");
const { formatWhatsAppResponse } = require("./src/services/twilioService");

async function simulateRequest(method, path, body = {}, headers = {}) {
  // Simple in-process request dispatcher for Express app
  return new Promise((resolve, reject) => {
    const req = {
      method,
      url: path,
      originalUrl: path,
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        ...headers,
      },
      body,
      query: {},
      params: {},
    };

    let statusCode = 200;
    let responseHeaders = {};
    let responseBody = "";

    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      type(type) {
        responseHeaders["content-type"] = type;
        return this;
      },
      setHeader(k, v) {
        responseHeaders[k] = v;
        return this;
      },
      send(data) {
        responseBody = data;
        resolve({ statusCode, headers: responseHeaders, body: responseBody });
      },
      json(data) {
        responseHeaders["content-type"] = "application/json";
        responseBody = data;
        resolve({ statusCode, headers: responseHeaders, body: responseBody });
      },
    };

    app.handle(req, res, (err) => {
      if (err) reject(err);
      else resolve({ statusCode: 404, headers: responseHeaders, body: "Not Found" });
    });
  });
}

async function runTests() {
  console.log("==================================================");
  console.log("🧪 STARTING INTEGRATION TESTS FOR BACKEND MEMBER 3");
  console.log("==================================================\n");

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      console.log(`⏳ Test ${total}: ${name}`);
      await fn();
      console.log(`✅ PASSED: ${name}\n`);
      passed++;
    } catch (err) {
      console.error(`❌ FAILED: ${name}`);
      console.error(err);
      console.log("\n");
    }
  }

  // --- GEMINI TESTS ---
  await test("Gemini Test 1 (English): 'I have fever and cough'", async () => {
    const res = await analyzeSymptoms("I have fever and cough", "en");
    assert.strictEqual(res.intent, "SYMPTOM");
    assert.strictEqual(res.language, "en");
    assert.ok(["HIGH", "MEDIUM", "LOW"].includes(res.priority));
    assert.ok(Array.isArray(res.symptoms) && res.symptoms.length > 0);
    assert.ok(typeof res.recommendation === "string" && res.recommendation.length > 0);
    console.log("   Result Priority:", res.priority, "| Symptoms:", res.symptoms);
  });

  await test("Gemini Test 2 (Telugu Script): 'నాకు జ్వరం మరియు దగ్గు ఉంది'", async () => {
    const res = await analyzeSymptoms("నాకు జ్వరం మరియు దగ్గు ఉంది", "te");
    assert.strictEqual(res.intent, "SYMPTOM");
    assert.strictEqual(res.language, "te");
    assert.ok(Array.isArray(res.symptoms) && res.symptoms.length > 0);
    console.log("   Result Language:", res.language, "| Symptoms:", res.symptoms);
  });

  await test("Gemini Test 3 (Hindi): 'मुझे बुखार है'", async () => {
    const res = await analyzeSymptoms("मुझे बुखार है", "hi");
    assert.strictEqual(res.intent, "SYMPTOM");
    assert.strictEqual(res.language, "hi");
    assert.ok(Array.isArray(res.symptoms) && res.symptoms.length > 0);
    console.log("   Result Language:", res.language, "| Symptoms:", res.symptoms);
  });

  await test("Gemini Test 4 (Telugu Transliterated English): 'jwaram vastundi'", async () => {
    const res = await analyzeSymptoms("jwaram vastundi", "te");
    assert.strictEqual(res.intent, "SYMPTOM");
    assert.strictEqual(res.language, "te");
    assert.ok(Array.isArray(res.symptoms) && res.symptoms.length > 0);
    console.log("   Result Language:", res.language, "| Symptoms:", res.symptoms);
  });

  await test("Gemini Test 5 (Emergency High Priority): 'I have severe chest pain and difficulty breathing'", async () => {
    const res = await analyzeSymptoms("I have severe chest pain and difficulty breathing", "en");
    assert.strictEqual(res.priority, "HIGH");
    assert.ok(res.redFlags.length > 0);
    console.log("   Result Priority:", res.priority, "| Red Flags:", res.redFlags);
  });

  // --- TWILIO WHATSAPP WEBHOOK TESTS ---
  const freshPhone = `+91998877${Date.now().toString().slice(-4)}`;

  await test("WhatsApp Webhook 1: First message 'Hi' -> Language Selection Menu", async () => {
    const res = await simulateRequest("POST", "/api/twilio/webhook", {
      From: `whatsapp:${freshPhone}`,
      Body: "Hi",
    });
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.includes("<Response>"));
    assert.ok(res.body.includes("Welcome to RuralCare"));
    assert.ok(res.body.includes("1️⃣ English"));
    assert.ok(res.body.includes("2️⃣ हिन्दी"));
    assert.ok(res.body.includes("3️⃣ తెలుగు"));
    console.log("   Received language selection prompt successfully.");
  });

  await test("WhatsApp Webhook 2: Select '3' -> Telugu Menu", async () => {
    const res = await simulateRequest("POST", "/api/twilio/webhook", {
      From: `whatsapp:${freshPhone}`,
      Body: "3",
    });
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.includes("నేను మీకు ఎలా సహాయపడగలను?"));
    assert.ok(res.body.includes("1️⃣ నా లక్షణాలను తనిఖీ చేయండి"));
    console.log("   Received localized Telugu menu successfully.");
  });

  await test("WhatsApp Webhook 3: Send Telugu Symptoms 'నాకు జ్వరం ఉంది' -> Triage Assessment", async () => {
    const res = await simulateRequest("POST", "/api/twilio/webhook", {
      From: `whatsapp:${freshPhone}`,
      Body: "నాకు జ్వరం ఉంది",
    });
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.includes("RuralCare AI"));
    assert.ok(res.body.includes("ప్రాథమిక అంచనా") || res.body.includes("లక్షణాలు"));
    console.log("   Received Telugu AI triage assessment successfully.");
  });

  await test("WhatsApp Webhook 4: Send 'LANG' -> Reset to Language Selection", async () => {
    const res = await simulateRequest("POST", "/api/twilio/webhook", {
      From: `whatsapp:${freshPhone}`,
      Body: "LANG",
    });
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.includes("Please select your language"));
    console.log("   Language selection reset successfully.");
  });

  await test("WhatsApp Webhook 5: Direct symptom message from new number", async () => {
    const directPhone = "+911122334455";
    const res = await simulateRequest("POST", "/api/twilio/webhook", {
      From: `whatsapp:${directPhone}`,
      Body: "I have high fever and shivering",
    });
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.includes("RuralCare AI Preliminary Assessment"));
    assert.ok(res.body.includes("Symptoms identified"));
    console.log("   Direct symptom input processed immediately.");
  });

  // --- TRIAGE REST ENDPOINTS TESTS ---
  await test("REST Endpoint POST /api/triage: Symptom Analysis", async () => {
    const res = await simulateRequest(
      "POST",
      "/api/triage",
      {
        patientId: "patient-123",
        message: "Patient complains of headache and nausea",
        language: "en",
        source: "website",
      },
      { "content-type": "application/json" }
    );
    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.symptoms.length > 0);
    assert.strictEqual(res.body.data.source, "website");
    console.log("   Created triage record via REST successfully.");
  });

  await test("REST Endpoint GET /api/patients/:id/triage: Get Patient History", async () => {
    const res = await simulateRequest("GET", "/api/patients/patient-123/triage");
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    console.log("   Retrieved patient triage endpoint successfully.");
  });

  console.log("==================================================");
  console.log(`🏁 TEST SUMMARY: ${passed}/${total} TESTS PASSED`);
  console.log("==================================================");

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
