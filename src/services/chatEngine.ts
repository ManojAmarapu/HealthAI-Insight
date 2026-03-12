import { isGeminiAvailable, getGeminiModel, HEALTH_SYSTEM_INSTRUCTION } from "./geminiClient";

// ─── Conversation history type (matches Gemini SDK's Content type) ───────────
export interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

// ─── Gemini-powered response (async, with conversation history) ───────────────
export const generateAIResponseWithGemini = async (
  userMessage: string,
  history: ChatMessage[]
): Promise<string> => {
  try {
    const model = getGeminiModel();

    // Build the full conversation: system context + past history + new message
    const contents = [
      // Inject system instruction as first user turn + model ack
      {
        role: "user" as const,
        parts: [{ text: HEALTH_SYSTEM_INSTRUCTION }],
      },
      {
        role: "model" as const,
        parts: [{ text: "Understood. I'm HealthAI, ready to help with health questions." }],
      },
      // Previous conversation turns
      ...history,
      // New user message
      {
        role: "user" as const,
        parts: [{ text: userMessage }],
      },
    ];

    const result = await model.generateContent({ contents });
    const text = result.response.text().trim();
    return text || generateAIResponse(userMessage);
  } catch (err) {
    console.error("[HealthAI] Gemini chat error, using fallback:", err);
    return generateAIResponse(userMessage);
  }
};

// ─── Rule-based fallback (synchronous — always available) ────────────────────
export const generateAIResponse = (userMessage: string): string => {
  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes("headache") || lowerMessage.includes("head pain") || lowerMessage.includes("migraine") || /\bhead(ache)?s?\b/i.test(lowerMessage)) {
    return "For headaches, I recommend: 1) Stay hydrated - drink plenty of water, 2) Get adequate rest in a quiet, dark room, 3) Apply a cold or warm compress, 4) Consider over-the-counter pain relievers like acetaminophen or ibuprofen. If headaches persist or worsen, please consult a healthcare professional.";
  }
  if (lowerMessage.includes("fever") || lowerMessage.includes("temperature") || lowerMessage.includes("high temp")) {
    return "For fever management: 1) Stay hydrated with water, clear broths, or electrolyte solutions, 2) Rest is crucial for recovery, 3) Use light clothing and keep room cool, 4) Consider fever reducers like acetaminophen or ibuprofen if needed. Seek medical attention if fever exceeds 103°F (39.4°C) or persists for more than 3 days.";
  }
  if (lowerMessage.includes("common cold") || lowerMessage.includes("runny nose") || lowerMessage.includes("sneezing") || lowerMessage.includes(" cough") || lowerMessage.startsWith("cough")) {
    return "For cold symptoms: 1) Get plenty of rest to help your immune system fight the virus, 2) Stay hydrated with warm liquids like tea or soup, 3) Use a humidifier or breathe steam from hot shower, 4) Gargle with salt water for sore throat. Most colds resolve within 7-10 days. See a doctor if symptoms worsen or last longer than 2 weeks.";
  }
  if (lowerMessage.includes("stomach") || lowerMessage.includes("nausea") || lowerMessage.includes("digestive") || lowerMessage.includes("vomit") || lowerMessage.includes("diarrhea")) {
    return "For digestive issues: 1) Try the BRAT diet (Bananas, Rice, Applesauce, Toast), 2) Stay hydrated with small, frequent sips of water, 3) Avoid dairy, fatty, or spicy foods temporarily, 4) Consider ginger tea for nausea. If symptoms persist beyond 24-48 hours or you have severe pain, please consult a healthcare provider.";
  }
  if (lowerMessage.includes("sleep") || lowerMessage.includes("insomnia") || lowerMessage.includes("can't sleep") || lowerMessage.includes("cannot sleep")) {
    return "For better sleep: 1) Maintain a consistent sleep schedule, 2) Create a relaxing bedtime routine, 3) Keep your bedroom cool, dark, and quiet, 4) Avoid screens 1 hour before bed, 5) Limit caffeine after 2 PM. If sleep problems persist, consider consulting a sleep specialist.";
  }
  if (lowerMessage.includes("back pain") || lowerMessage.includes("backache") || lowerMessage.includes("spine")) {
    return "For back pain: 1) Apply ice for the first 48-72 hours, then switch to heat, 2) Stay gently active with light walking, 3) Avoid heavy lifting or twisting movements, 4) Consider over-the-counter pain relievers like ibuprofen. Seek medical attention if you have severe pain, numbness, or weakness in the legs.";
  }
  if (lowerMessage.includes("anxiety") || lowerMessage.includes("stress") || lowerMessage.includes("panic")) {
    return "For managing anxiety: 1) Practice deep breathing (inhale 4 counts, hold 4, exhale 4), 2) Try grounding techniques like the 5-4-3-2-1 method, 3) Regular physical exercise helps reduce anxiety, 4) Limit caffeine and alcohol. If anxiety is affecting your daily life, please consider speaking with a mental health professional.";
  }

  return "Thank you for your question. While I can provide general health information, it's important to remember that I'm an AI assistant and cannot replace professional medical advice. For specific symptoms or concerns, please consult with a qualified healthcare professional. Is there anything else about general health and wellness I can help you with?";
};

// ─── Main export: auto-selects Gemini or fallback ────────────────────────────
export const getAIResponse = async (
  userMessage: string,
  history: ChatMessage[]
): Promise<string> => {
  if (isGeminiAvailable()) {
    return generateAIResponseWithGemini(userMessage, history);
  }
  return generateAIResponse(userMessage);
};
