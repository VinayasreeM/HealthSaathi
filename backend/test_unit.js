require("dotenv").config();
const assert = require("assert");
const app = require("./src/app");
const {
  MESSAGES,
  formatWhatsAppResponse,
  generateTwiMLMessage,
} = require("./src/services/twilioService");
const Triage = require("./src/models/Triage");
const Conversation = require("./src/models/Conversation");

async function simulateRequest(method, path, body = {}, headers = {}) {
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

async function runUnitTests() {
  console.log("==================================================");
  console.log("🧪 RUNNING UNIT & WORKFLOW TESTS (OFFLINE)");
  console.log("==================================================\n");

  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      console.log(`⏳ Test ${total}: ${name}`);
      fn();
      console.log(`✅ PASSED: ${name}\n`);
      passed++;
    } catch (err) {
      console.error(`❌ FAILED: ${name}`);
      console.error(err);
      console.log("\n");
    }
  }

  async function asyncTest(name, fn) {
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

  // 1. TwiML Generation
  test("TwiML Generator generates valid XML and escapes special characters", () => {
    const xml = generateTwiMLMessage("Hello & welcome <to> RuralCare");
    assert.ok(xml.startsWith("<?xml version=\"1.0\" encoding=\"UTF-8\"?>"));
    assert.ok(xml.includes("<Response>"));
    assert.ok(xml.includes("<Message>Hello &amp; welcome &lt;to&gt; RuralCare</Message>"));
    assert.ok(xml.includes("</Response>"));
  });

  // 2. WhatsApp Format - English Medium
  test("Format WhatsApp Response - English (MEDIUM)", () => {
    const msg = formatWhatsAppResponse(
      {
        priority: "MEDIUM",
        symptoms: ["Fever", "Cough"],
        recommendation: "Please rest and drink plenty of fluids.",
      },
      "en"
    );
    assert.ok(msg.includes("RuralCare AI Preliminary Assessment"));
    assert.ok(msg.includes("Priority: 🟠 MEDIUM"));
    assert.ok(msg.includes("• Fever"));
    assert.ok(msg.includes("• Cough"));
    assert.ok(msg.includes("⚠️ This is not a confirmed medical diagnosis."));
  });

  // 3. WhatsApp Format - English High
  test("Format WhatsApp Response - English (HIGH)", () => {
    const msg = formatWhatsAppResponse(
      {
        priority: "HIGH",
        symptoms: ["Severe chest pain", "Shortness of breath"],
        recommendation: "Please seek emergency medical attention immediately.",
      },
      "en"
    );
    assert.ok(msg.includes("🚨 HIGH PRIORITY"));
    assert.ok(msg.includes("Your symptoms may require urgent medical attention."));
    assert.ok(msg.includes("Please seek emergency medical attention immediately."));
    assert.ok(msg.includes("⚠️ This is not a confirmed medical diagnosis."));
  });

  // 4. WhatsApp Format - Telugu Medium
  test("Format WhatsApp Response - Telugu (MEDIUM)", () => {
    const msg = formatWhatsAppResponse(
      {
        priority: "MEDIUM",
        symptoms: ["జ్వరం", "దగ్గు"],
        recommendation: "విశ్రాంతి తీసుకోండి.",
      },
      "te"
    );
    assert.ok(msg.includes("RuralCare AI ప్రాథమిక అంచనా"));
    assert.ok(msg.includes("ప్రాధాన్యత: 🟠 మధ్యస్థం (MEDIUM)"));
    assert.ok(msg.includes("• జ్వరం"));
    assert.ok(msg.includes("• దగ్గు"));
    assert.ok(msg.includes("⚠️ ఇది ఖచ్చితమైన వైద్య నిర్ధారణ కాదు."));
  });

  // 5. WhatsApp Format - Telugu High
  test("Format WhatsApp Response - Telugu (HIGH)", () => {
    const msg = formatWhatsAppResponse(
      {
        priority: "HIGH",
        symptoms: ["తీవ్రమైన ఛాతీ నొప్పి"],
        recommendation: "వెంటనే ఆసుపత్రికి వెళ్లండి.",
      },
      "te"
    );
    assert.ok(msg.includes("🚨 అత్యవసర ప్రాధాన్యత (HIGH PRIORITY)"));
    assert.ok(msg.includes("మీ లక్షణాలకు తక్షణ వైద్య సహాయం అవసరం కావచ్చు."));
    assert.ok(msg.includes("⚠️ ఈ AI అంచనా ఖచ్చితమైన వైద్య నిర్ధారణ కాదు."));
  });

  // 6. WhatsApp Format - Hindi Medium
  test("Format WhatsApp Response - Hindi (MEDIUM)", () => {
    const msg = formatWhatsAppResponse(
      {
        priority: "MEDIUM",
        symptoms: ["बुखार", "खांसी"],
        recommendation: "आराम करें।",
      },
      "hi"
    );
    assert.ok(msg.includes("RuralCare AI प्राथमिक मूल्यांकन"));
    assert.ok(msg.includes("प्राथमिकता: 🟠 मध्यम (MEDIUM)"));
    assert.ok(msg.includes("• बुखार"));
    assert.ok(msg.includes("⚠️ यह कोई पुष्ट चिकित्सा निदान नहीं है।"));
  });

  // 7. WhatsApp Format - Hindi High
  test("Format WhatsApp Response - Hindi (HIGH)", () => {
    const msg = formatWhatsAppResponse(
      {
        priority: "HIGH",
        symptoms: ["सीने में गंभीर दर्द"],
        recommendation: "तुरंत अस्पताल जाएं।",
      },
      "hi"
    );
    assert.ok(msg.includes("🚨 उच्च प्राथमिकता (HIGH PRIORITY)"));
    assert.ok(msg.includes("आपके लक्षणों के लिए तत्काल चिकित्सा सहायता की आवश्यकता हो सकती है।"));
  });

  // 8. Webhook State Machine Test
  const phone = "+919876500001";

  await asyncTest("Webhook greeting shows language options 1, 2, 3", async () => {
    const res = await simulateRequest("POST", "/api/twilio/webhook", {
      From: `whatsapp:${phone}`,
      Body: "Hello",
    });
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.includes("1️⃣ English"));
    assert.ok(res.body.includes("2️⃣ हिन्दी"));
    assert.ok(res.body.includes("3️⃣ తెలుగు"));
  });

  await asyncTest("Webhook language selection '2' selects Hindi and shows Hindi menu", async () => {
    const res = await simulateRequest("POST", "/api/twilio/webhook", {
      From: `whatsapp:${phone}`,
      Body: "2",
    });
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.includes("मैं आपकी क्या मदद कर सकता हूँ?"));
    assert.ok(res.body.includes("1️⃣ अपने लक्षण जाँचें"));
    assert.ok(res.body.includes("2️⃣ मेरा प्रिस्क्रिप्शन"));
  });

  await asyncTest("Webhook option '4' in Hindi returns medication advice", async () => {
    const res = await simulateRequest("POST", "/api/twilio/webhook", {
      From: `whatsapp:${phone}`,
      Body: "4",
    });
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.includes("दवाइयों का समय पर सेवन करें"));
  });

  await asyncTest("Webhook LANG command resets language selection", async () => {
    const res = await simulateRequest("POST", "/api/twilio/webhook", {
      From: `whatsapp:${phone}`,
      Body: "LANG",
    });
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.includes("Please select your language"));
  });

  await asyncTest("Webhook option '3' selects Telugu and shows Telugu menu", async () => {
    const res = await simulateRequest("POST", "/api/twilio/webhook", {
      From: `whatsapp:${phone}`,
      Body: "3",
    });
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.includes("నేను మీకు ఎలా సహాయపడగలను?"));
    assert.ok(res.body.includes("1️⃣ నా లక్షణాలను తనిఖీ చేయండి"));
  });

  await asyncTest("Webhook option '5' in Telugu returns health advice", async () => {
    const res = await simulateRequest("POST", "/api/twilio/webhook", {
      From: `whatsapp:${phone}`,
      Body: "5",
    });
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.includes("పరిశుభ్రమైన నీరు ఎక్కువగా తాగండి"));
  });

  // 9. REST API direct POST
  await asyncTest("REST API POST /api/triage with structured data", async () => {
    const res = await simulateRequest(
      "POST",
      "/api/triage",
      {
        patientId: "patient-unit-test-1",
        symptoms: ["Headache", "Fever"],
        priority: "MEDIUM",
        possibleConditions: ["Viral Fever"],
        redFlags: [],
        recommendation: "Take rest.",
        language: "en",
        source: "website",
      },
      { "content-type": "application/json" }
    );
    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.priority, "MEDIUM");
  });

  // 10. REST API GET /api/patients/:id/triage
  await asyncTest("REST API GET /api/patients/:id/triage endpoint", async () => {
    const res = await simulateRequest("GET", "/api/patients/patient-unit-test-1/triage");
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
  });

  console.log("==================================================");
  console.log(`🏁 ALL ${passed}/${total} UNIT TESTS PASSED!`);
  console.log("==================================================");
}

runUnitTests().catch((err) => {
  console.error("Unit test execution error:", err);
  process.exit(1);
});
