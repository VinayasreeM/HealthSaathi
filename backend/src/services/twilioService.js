// Official Twilio Node.js SDK client — initialized once as singleton
let _twilioClient = null;
function getTwilioClient() {
  if (_twilioClient) return _twilioClient;
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) {
    console.warn("[TwilioService] TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN not configured.");
    return null;
  }
  try {
    const twilio = require("twilio");
    _twilioClient = twilio(accountSid, authToken);
    return _twilioClient;
  } catch (err) {
    console.error("[TwilioService] Failed to initialize Twilio client:", err.message);
    return null;
  }
}

const MESSAGES = {
  welcomeLanguagePrompt: `🏥 Welcome to RuralCare

Please select your language:

1️⃣ English
2️⃣ हिन्दी
3️⃣ తెలుగు

Reply with 1, 2, or 3.`,

  unknownPatient: `We could not find your RuralCare patient account.
Please register on the RuralCare website first.`,

  menus: {
    en: `How can I help you?

1️⃣ Check my symptoms
2️⃣ My prescription
3️⃣ My next appointment
4️⃣ My medication schedule
5️⃣ Health recommendations

You can also directly describe your symptoms.`,

    hi: `मैं आपकी क्या मदद कर सकता हूँ?

1️⃣ अपने लक्षण जाँचें
2️⃣ मेरा प्रिस्क्रिप्शन
3️⃣ मेरा अगला अपॉइंटमेंट
4️⃣ दवाइयों की समय सारणी
5️⃣ स्वास्थ्य संबंधी सुझाव

आप सीधे अपने लक्षण भी बता सकते हैं।`,

    te: `నేను మీకు ఎలా సహాయపడగలను?

1️⃣ నా లక్షణాలను తనిఖీ చేయండి
2️⃣ నా ప్రిస్క్రిప్షన్
3️⃣ నా తదుపరి అపాయింట్‌మెంట్
4️⃣ నా ఔషధాల సమయ పట్టిక
5️⃣ ఆరోగ్య సూచనలు

మీరు మీ లక్షణాలను నేరుగా కూడా తెలియజేయవచ్చు.`,
  },

  menuOptions: {
    en: {
      1: "Please describe your symptoms in detail (e.g. 'I have a headache and fever since yesterday').",
      2: "You can view your active prescriptions by logging into the RuralCare patient portal or contacting your clinic.",
      3: "To check or book your next doctor appointment, please visit the RuralCare website or contact your local health center.",
      4: "Please follow your prescribed dosage timings carefully. Check the RuralCare portal for your complete medication schedule.",
      5: "💡 General Health Tips: Drink plenty of clean water, maintain a balanced diet, get 7-8 hours of sleep, and wash hands regularly.",
    },
    hi: {
      1: "कृपया अपने लक्षणों का विस्तार से वर्णन करें (उदा. 'मुझे कल से सिरदर्द और बुखार है')।",
      2: "आप RuralCare पोर्टल पर लॉग इन करके या अपने नजदीकी स्वास्थ्य केंद्र से संपर्क करके अपने नुस्खे देख सकते हैं।",
      3: "अपने अगले अपॉइंटमेंट की जांच या बुकिंग के लिए कृपया RuralCare वेबसाइट पर जाएं।",
      4: "कृपया अपनी दवाइयों का समय पर सेवन करें। पूरी समय सारणी के लिए RuralCare पोर्टल देखें।",
      5: "💡 स्वास्थ्य सुझाव: पर्याप्त पानी पिएं, पौष्टिक भोजन करें, 7-8 घंटे की नींद लें और नियमित रूप से हाथ धोएं।",
    },
    te: {
      1: "దయచేసి మీ లక్షణాలను వివరంగా తెలపండి (ఉదా: 'నాకు నిన్నటి నుండి తలనొప్పి మరియు జ్వరం ఉంది').",
      2: "మీరు మీ ప్రిస్క్రిప్షన్‌లను RuralCare పేషెంట్ పోర్టల్ ద్వారా లేదా మీ క్లినిక్‌ని సంప్రదించి తెలుసుకోవచ్చు.",
      3: "మీ తదుపరి అపాయింట్‌మెంట్‌ను తనిఖీ చేయడానికి లేదా బుక్ చేసుకోవడానికి RuralCare వెబ్‌సైట్‌ను సందర్శించండి.",
      4: "దయచేసి మీ మందులను సరైన సమయానికి తీసుకోండి. పూర్తి షెడ్యూల్ కోసం RuralCare పోర్టల్ చూడండి.",
      5: "💡 సాధారణ ఆరోగ్య చిట్కాలు: పరిశుభ్రమైన నీరు ఎక్కువగా తాగండి, సమతుల్య ఆహారం తీసుకోండి, రోజూ 7-8 గంటలు నిద్రపోండి.",
    },
  },

  fallbackError: {
    en: "Sorry, we could not process your symptoms right now. Please try again or contact a doctor directly.",
    hi: "क्षमा करें, हम अभी आपके लक्षणों को संसाधित नहीं कर सके। कृपया पुनः प्रयास करें या सीधे डॉक्टर से संपर्क करें।",
    te: "క్షమించండి, ప్రస్తుతం మీ లక్షణాలను ప్రాసెస్ చేయలేకపోయాము. దయచేసి మళ్లీ ప్రయత్నించండి లేదా నేరుగా వైద్యుడిని సంప్రదించండి.",
  },
};

function formatWhatsAppResponse(assessment, language = "en") {
  const lang = ["en", "hi", "te"].includes(language) ? language : "en";
  const priority = (assessment.priority || "MEDIUM").toUpperCase();
  const symptoms = Array.isArray(assessment.symptoms) && assessment.symptoms.length > 0
    ? assessment.symptoms
    : [];
  const recommendation = assessment.recommendation || "";

  if (priority === "HIGH") {
    if (lang === "te") {
      const symptomList = symptoms.length > 0
        ? symptoms.map((s) => `• ${s}`).join("\n")
        : "• తీవ్రమైన లక్షణాలు";

      return `🚨 అత్యవసర ప్రాధాన్యత (HIGH PRIORITY)

మీ లక్షణాలకు తక్షణ వైద్య సహాయం అవసరం కావచ్చు.

ప్రాధాన్యత: 🔴 అత్యవసరం (HIGH)

గుర్తించిన లక్షణాలు:
${symptomList}

సిఫార్సు:
${recommendation || "దయచేసి వెంటనే అత్యవసర వైద్య సంరక్షణను పొందండి లేదా సమీపంలోని ఆసుపత్రికి వెళ్లండి."}

⚠️ ఈ AI అంచనా ఖచ్చితమైన వైద్య నిర్ధారణ కాదు.`;
    }

    if (lang === "hi") {
      const symptomList = symptoms.length > 0
        ? symptoms.map((s) => `• ${s}`).join("\n")
        : "• गंभीर लक्षण";

      return `🚨 उच्च प्राथमिकता (HIGH PRIORITY)

आपके लक्षणों के लिए तत्काल चिकित्सा सहायता की आवश्यकता हो सकती है।

प्राथमिकता: 🔴 उच्च (HIGH)

पहचाने गए लक्षण:
${symptomList}

सुझाव:
${recommendation || "कृपया तुरंत किसी चिकित्सक या आपातकालीन केंद्र से संपर्क करें।"}

⚠️ यह एआई मूल्यांकन कोई अंतिम निदान नहीं है।`;
    }

    const symptomList = symptoms.length > 0
      ? symptoms.map((s) => `• ${s}`).join("\n")
      : "• Severe symptoms";

    return `🚨 HIGH PRIORITY

Your symptoms may require urgent medical attention.

Priority: 🔴 HIGH

Symptoms identified:
${symptomList}

Recommendation:
${recommendation || "Please seek urgent professional medical attention immediately."}

⚠️ This is not a confirmed medical diagnosis.`;
  }

  // Medium / Low priority format
  const priorityBadge = priority === "LOW" ? "🟢 LOW" : "🟠 MEDIUM";

  if (lang === "te") {
    const symptomList = symptoms.length > 0
      ? symptoms.map((s) => `• ${s}`).join("\n")
      : "• లక్షణాలు నమోదు చేయబడ్డాయి";

    return `🏥 RuralCare AI ప్రాథమిక అంచనా

ప్రాధాన్యత: ${priorityBadge === "🟢 LOW" ? "🟢 తక్కువ (LOW)" : "🟠 మధ్యస్థం (MEDIUM)"}

గుర్తించిన లక్షణాలు:
${symptomList}

సిఫార్సు:
${recommendation || "లక్షణాలు కొనసాగితే లేదా తీవ్రమైతే దయచేసి వైద్యుడిని సంప్రదించండి."}

⚠️ ఇది ఖచ్చితమైన వైద్య నిర్ధారణ కాదు.`;
  }

  if (lang === "hi") {
    const symptomList = symptoms.length > 0
      ? symptoms.map((s) => `• ${s}`).join("\n")
      : "• लक्षण दर्ज किए गए";

    return `🏥 RuralCare AI प्राथमिक मूल्यांकन

प्राथमिकता: ${priorityBadge === "🟢 LOW" ? "🟢 निम्न (LOW)" : "🟠 मध्यम (MEDIUM)"}

पहचाने गए लक्षण:
${symptomList}

सुझाव:
${recommendation || "यदि लक्षण बने रहते हैं या बिगड़ते हैं तो कृपया डॉक्टर से परामर्श लें।"}

⚠️ यह कोई पुष्ट चिकित्सा निदान नहीं है।`;
  }

  // Default English
  const symptomList = symptoms.length > 0
    ? symptoms.map((s) => `• ${s}`).join("\n")
    : "• Reported symptoms";

  return `🏥 RuralCare AI Preliminary Assessment

Priority: ${priorityBadge}

Symptoms identified:
${symptomList}

Recommendation:
${recommendation || "Please consult a doctor if symptoms persist or worsen."}

⚠️ This is not a confirmed medical diagnosis.`;
}

function generateTwiMLMessage(body) {
  const sanitized = String(body)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Message>${sanitized}</Message>\n</Response>`;
}

function formatWhatsAppNumber(num) {
  let clean = String(num || "").trim();
  if (!clean.startsWith("whatsapp:")) {
    // Strip any non-digit/non-plus chars except existing whatsapp prefix
    const digits = clean.replace(/[^\d+]/g, "");
    const e164 = digits.startsWith("+") ? digits : `+${digits}`;
    clean = `whatsapp:${e164}`;
  }
  return clean;
}

async function sendWhatsAppMessage(to, body) {
  const fromRaw = process.env.TWILIO_WHATSAPP_NUMBER || process.env.TWILIO_PHONE_NUMBER;
  if (!fromRaw) {
    console.warn("[TwilioService] TWILIO_WHATSAPP_NUMBER not configured.");
    return { success: false, reason: "TWILIO_NOT_CONFIGURED" };
  }

  const client = getTwilioClient();
  if (!client) {
    return { success: false, reason: "TWILIO_CLIENT_INIT_FAILED" };
  }

  const formattedTo = formatWhatsAppNumber(to);
  const formattedFrom = formatWhatsAppNumber(fromRaw);

  try {
    console.log(`[TwilioService] Sending WhatsApp to ${formattedTo} from ${formattedFrom}`);
    const message = await client.messages.create({
      to: formattedTo,
      from: formattedFrom,
      body,
    });
    console.log(`[TwilioService] WhatsApp sent. SID: ${message.sid}`);
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error("[TwilioService] WhatsApp send error:", error.message);
    return { success: false, error: error.message };
  }
}

async function sendSMS(to, body) {
  const fromRaw = process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_WHATSAPP_NUMBER;
  if (!fromRaw) {
    console.warn("[TwilioService] TWILIO_PHONE_NUMBER not configured.");
    return { success: false, reason: "TWILIO_NOT_CONFIGURED" };
  }

  const client = getTwilioClient();
  if (!client) {
    return { success: false, reason: "TWILIO_CLIENT_INIT_FAILED" };
  }

  // SMS uses plain E.164 number (no whatsapp: prefix)
  const cleanTo = String(to).replace(/^whatsapp:/i, "").trim();
  const cleanFrom = String(fromRaw).replace(/^whatsapp:/i, "").trim();

  try {
    console.log(`[TwilioService] Sending SMS to ${cleanTo}`);
    const message = await client.messages.create({
      to: cleanTo,
      from: cleanFrom,
      body,
    });
    console.log(`[TwilioService] SMS sent. SID: ${message.sid}`);
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error("[TwilioService] SMS send error:", error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  MESSAGES,
  formatWhatsAppResponse,
  generateTwiMLMessage,
  sendWhatsAppMessage,
  sendSMS,
  getTwilioClient,
};
