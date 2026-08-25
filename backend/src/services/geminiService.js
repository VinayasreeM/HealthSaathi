const DEFAULT_MODEL = "gemini-3.6-flash";
const REQUEST_TIMEOUT_MS = 30000;
const SUPPORTED_LANGUAGES = new Set(["en", "hi", "te"]);
const PRIORITIES = new Set(["HIGH", "MEDIUM", "LOW"]);
const INTENTS = new Set(["SYMPTOM", "GENERAL"]);

class GeminiServiceError extends Error {
  constructor(message, code, cause) {
    super(message);
    this.name = "GeminiServiceError";
    this.code = code;
    this.statusCode = 502;
    this.cause = cause;
  }
}

function buildPrompt(message, language) {
  return `You are RuralCare's preliminary health-triage assistant. Analyse the patient's message below. The patient selected ${language} as their language. They may write English, Hindi, Telugu, or Telugu transliterated into English letters. Understand the message regardless of its script.

Return one JSON object only, with no Markdown or extra text. It must have exactly these fields:
{
  "intent": "SYMPTOM" | "GENERAL",
  "language": "${language}",
  "priority": "HIGH" | "MEDIUM" | "LOW",
  "symptoms": ["..."],
  "possibleConditions": ["..."],
  "redFlags": ["..."],
  "recommendation": "..."
}

Rules:
- Keep language exactly "${language}" and write patient-facing fields in that selected language where appropriate.
- This is a preliminary assessment only, never a confirmed diagnosis. Phrase possibleConditions as possibilities, not certainties.
- Use intent SYMPTOM for health symptoms and GENERAL for non-symptom/general health messages.
- If there are serious red flags, use HIGH priority and recommend urgent professional medical attention or emergency care.
- Arrays must always contain strings. Do not add fields.

Patient message:
${message}`;
}

function responseSchema(language) {
  return {
    type: "OBJECT",
    properties: {
      intent: { type: "STRING", enum: ["SYMPTOM", "GENERAL"] },
      language: { type: "STRING", enum: [language] },
      priority: { type: "STRING", enum: ["HIGH", "MEDIUM", "LOW"] },
      symptoms: { type: "ARRAY", items: { type: "STRING" } },
      possibleConditions: { type: "ARRAY", items: { type: "STRING" } },
      redFlags: { type: "ARRAY", items: { type: "STRING" } },
      recommendation: { type: "STRING" },
    },
    required: [
      "intent",
      "language",
      "priority",
      "symptoms",
      "possibleConditions",
      "redFlags",
      "recommendation",
    ],
  };
}

function parseAssessment(text, language) {
  let assessment;

  try {
    let cleanText = text.trim();
    if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    }
    assessment = JSON.parse(cleanText);
  } catch (error) {
    throw new GeminiServiceError("Gemini returned invalid JSON", "GEMINI_INVALID_JSON", error);
  }

  if (!assessment || typeof assessment !== "object" || Array.isArray(assessment)) {
    throw new GeminiServiceError("Gemini returned an unexpected response format", "GEMINI_INVALID_FORMAT");
  }

  // Normalize and validate fields
  const normalizedIntent = INTENTS.has(assessment.intent?.toUpperCase())
    ? assessment.intent.toUpperCase()
    : "SYMPTOM";

  const rawPriority = String(assessment.priority || "").toUpperCase();
  const normalizedPriority = PRIORITIES.has(rawPriority) ? rawPriority : "MEDIUM";

  const normalizedLanguage = SUPPORTED_LANGUAGES.has(assessment.language)
    ? assessment.language
    : language;

  const toStringArray = (arr) =>
    Array.isArray(arr)
      ? arr.map((item) => (typeof item === "string" ? item : String(item))).filter(Boolean)
      : typeof arr === "string" && arr.trim()
      ? [arr.trim()]
      : [];

  const symptoms = toStringArray(assessment.symptoms);
  const possibleConditions = toStringArray(assessment.possibleConditions);
  const redFlags = toStringArray(assessment.redFlags);
  const recommendation =
    typeof assessment.recommendation === "string"
      ? assessment.recommendation.trim()
      : "";

  return {
    intent: normalizedIntent,
    language: normalizedLanguage,
    priority: normalizedPriority,
    symptoms,
    possibleConditions,
    redFlags,
    recommendation,
  };
}

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function ruleBasedFallbackTriage(message, language = "en") {
  const lower = message.toLowerCase();
  const isTelugu = language === "te" || /[\u0C00-\u0C7F]/.test(message);
  const isHindi = language === "hi" || /[\u0900-\u097F]/.test(message);

  const lang = isTelugu ? "te" : isHindi ? "hi" : "en";

  // Check for severe emergency keywords
  const emergencyKeywords = [
    "chest pain",
    "difficulty breathing",
    "shortness of breath",
    "unconscious",
    "severe bleeding",
    "seizure",
    "stroke",
    "గుండె నొప్పి",
    "ఛాతీ నొప్పి",
    "శ్వాస",
    "सीने में दर्द",
    "सांस लेने में तकलीफ",
  ];

  const isEmergency = emergencyKeywords.some((k) => lower.includes(k) || message.includes(k));

  if (isEmergency) {
    if (lang === "te") {
      return {
        intent: "SYMPTOM",
        language: "te",
        priority: "HIGH",
        symptoms: ["తీవ్రమైన లక్షణాలు / ఛాతీ లేదా శ్వాసకోశ ఇబ్బంది"],
        possibleConditions: ["అత్యవసర వైద్య పరిస్థితి (Emergency Condition)"],
        redFlags: ["తీవ్రమైన ఛాతీ నొప్పి లేదా శ్వాస తీసుకోవడంలో ఇబ్బంది"],
        recommendation: "దయచేసి వెంటనే సమీప అత్యవసర ఆసుపత్రికి వెళ్లండి లేదా అత్యవసర వైద్య సహాయం పొందండి.",
      };
    }
    if (lang === "hi") {
      return {
        intent: "SYMPTOM",
        language: "hi",
        priority: "HIGH",
        symptoms: ["गंभीर लक्षण / सीने में दर्द या सांस लेने में तकलीफ"],
        possibleConditions: ["आपातकालीन चिकित्सीय स्थिति (Emergency Medical Condition)"],
        redFlags: ["सीने में गंभीर दर्द या सांस लेने में कठिनाई"],
        recommendation: "कृपया तुरंत निकटतम आपातकालीन अस्पताल जाएं या आपातकालीन चिकित्सा सहायता प्राप्त करें।",
      };
    }
    return {
      intent: "SYMPTOM",
      language: "en",
      priority: "HIGH",
      symptoms: ["Severe symptoms / chest pain or breathing distress"],
      possibleConditions: ["Emergency Medical Condition"],
      redFlags: ["Severe chest pain or difficulty breathing"],
      recommendation: "Please seek immediate emergency medical care or go to the nearest emergency hospital right away.",
    };
  }

  // Medium / Low priority symptom fallback
  if (lang === "te") {
    return {
      intent: "SYMPTOM",
      language: "te",
      priority: "MEDIUM",
      symptoms: ["జ్వరం / దగ్గు లేదా ఇతర ప్రాథమిక లక్షణాలు"],
      possibleConditions: ["వైరల్ ఇన్ఫెక్షన్ లేదా సాధారణ జలుబు"],
      redFlags: [],
      recommendation: "తగినంత విశ్రాంతి తీసుకోండి మరియు పుష్కలంగా ద్రవాలు తాగండి. లక్షణాలు తీవ్రమైతే వైద్యుడిని సంప్రదించండి.",
    };
  }
  if (lang === "hi") {
    return {
      intent: "SYMPTOM",
      language: "hi",
      priority: "MEDIUM",
      symptoms: ["बुखार / खांसी या सामान्य स्वास्थ्य लक्षण"],
      possibleConditions: ["वायरल संक्रमण या मौसमी सर्दी-जुकाम"],
      redFlags: [],
      recommendation: "पर्याप्त आराम करें और तरल पदार्थों का सेवन करें। यदि लक्षण 2-3 दिनों में ठीक न हों तो डॉक्टर से परामर्श लें।",
    };
  }
  return {
    intent: "SYMPTOM",
    language: "en",
    priority: "MEDIUM",
    symptoms: ["Fever / cough or reported symptoms"],
    possibleConditions: ["Viral infection or seasonal illness"],
    redFlags: [],
    recommendation: "Get adequate rest, stay hydrated, and consult a doctor if symptoms persist or worsen.",
  };
}

async function analyzeSymptoms(message, language, attempt = 1) {
  if (typeof message !== "string" || !message.trim()) {
    throw new GeminiServiceError("A non-empty symptom message is required", "INVALID_MESSAGE");
  }
  if (!SUPPORTED_LANGUAGES.has(language)) {
    throw new GeminiServiceError("Unsupported patient language", "INVALID_LANGUAGE");
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new GeminiServiceError("Gemini is not configured", "GEMINI_NOT_CONFIGURED");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: buildPrompt(message.trim(), language) }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: responseSchema(language),
          temperature: 0.2,
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      console.warn(`Gemini API returned status ${response.status}:`, errorBody);

      // If rate-limited (429), retry after short delay if small delay, else fallback
      if (response.status === 429 && attempt <= 1) {
        let waitMs = 3000;
        try {
          const parsed = JSON.parse(errorBody);
          const retryDelayStr = parsed?.error?.details?.find((d) => d["@type"]?.includes("RetryInfo"))?.retryDelay;
          if (retryDelayStr) {
            const seconds = parseFloat(retryDelayStr.replace("s", ""));
            if (!isNaN(seconds) && seconds > 0) waitMs = Math.min(Math.ceil(seconds * 1000) + 500, 4000);
          }
        } catch {
          waitMs = 3000;
        }

        if (waitMs <= 4000) {
          console.log(`Rate limit backoff. Retrying in ${waitMs}ms...`);
          await delay(waitMs);
          return await analyzeSymptoms(message, language, attempt + 1);
        }
      }

      // If daily quota exhausted or other error, fallback safely
      console.warn("Using fallback rule-based triage assessment.");
      return ruleBasedFallbackTriage(message, language);
    }

    const payload = await response.json();
    const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== "string") {
      throw new GeminiServiceError("Gemini returned an empty response", "GEMINI_EMPTY_RESPONSE");
    }

    return parseAssessment(text, language);
  } catch (error) {
    if (error instanceof GeminiServiceError) throw error;
    if (error.name === "AbortError") {
      throw new GeminiServiceError("Gemini request timed out", "GEMINI_TIMEOUT", error);
    }
    // For network failure, fallback gracefully
    console.warn("Gemini network error, using fallback assessment:", error.message);
    return ruleBasedFallbackTriage(message, language);
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { analyzeSymptoms, GeminiServiceError };

// Run manually after setting GEMINI_API_KEY: node -r dotenv/config src/services/geminiService.js
if (require.main === module) {
  const samples = [
    ["I have fever and cough", "en"],
    ["నాకు జ్వరం మరియు దగ్గు ఉంది", "te"],
    ["jwaram vastundi", "te"],
    ["मुझे बुखार है", "hi"],
    ["I have severe chest pain and difficulty breathing", "en"],
  ];

  (async () => {
    const results = [];
    for (const [message, language] of samples) {
      results.push(await analyzeSymptoms(message, language));
    }
    console.log(JSON.stringify(results, null, 2));
  })().catch((error) => {
      console.error(`${error.code}: ${error.message}`);
      process.exitCode = 1;
  });
}
