import { isGeminiAvailable, getGeminiModel, HEALTH_SYSTEM_INSTRUCTION } from "./geminiClient";

// ─── Conversation history type (matches Gemini SDK's Content type) ───────────
export interface ChatMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

// ─── Simple response cache (sessionStorage) — invalidated when tab closes ─────
const CACHE_PREFIX = "healthai_cache_";
const getCached = (key: string): string | null => {
  try { return sessionStorage.getItem(CACHE_PREFIX + key); } catch { return null; }
};
const setCache = (key: string, value: string) => {
  try { sessionStorage.setItem(CACHE_PREFIX + key, value); } catch {}
};

// ─── Gemini-powered response (async, with conversation history) ───────────────
export const generateAIResponseWithGemini = async (
  userMessage: string,
  history: ChatMessage[]
): Promise<string> => {
  // Check cache first (only for solo messages — not mid-conversation)
  const cacheKey = userMessage.trim().toLowerCase().slice(0, 120);
  if (history.length === 0) {
    const cached = getCached(cacheKey);
    if (cached) return cached;
  }

  try {
    const model = getGeminiModel();
    const contents = [
      { role: "user" as const, parts: [{ text: HEALTH_SYSTEM_INSTRUCTION }] },
      { role: "model" as const, parts: [{ text: "Got it! I'm HealthAI, your friendly health companion. I'll give you direct, helpful answers first — no unnecessary deflecting. What can I help you with today?" }] },
      ...history,
      { role: "user" as const, parts: [{ text: userMessage }] },
    ];

    const result = await model.generateContent({ contents });

    // Handle safety-blocked response
    const candidate = result.response.candidates?.[0];
    if (candidate?.finishReason === 'SAFETY') {
      return "I'm not able to respond to that specific request. Please ask your health question in a different way, and I'll do my best to help.";
    }

    const text = result.response.text().trim();
    const response = text || generateAIResponse(userMessage);

    // Cache single-message responses
    if (history.length === 0 && response) setCache(cacheKey, response);

    return response;
  } catch (err: unknown) {
    const errMsg = String(err);
    // Quota / rate limit — tell user rather than silent fallback
    if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('rate')) {
      return "⚠️ HealthAI's Gemini connection is temporarily at capacity. Using built-in knowledge instead...\n\n" + generateAIResponse(userMessage);
    }
    // Network error
    if (errMsg.includes('network') || errMsg.includes('fetch') || errMsg.includes('ENOTFOUND')) {
      return "⚠️ Can't reach the AI server right now. Using local knowledge instead...\n\n" + generateAIResponse(userMessage);
    }
    console.error("[HealthAI] Gemini chat error, using fallback:", err);
    return generateAIResponse(userMessage);
  }
};


// ─── Rule-based fallback (synchronous — always available) ────────────────────
export const generateAIResponse = (userMessage: string): string => {
  const msg = userMessage.toLowerCase();

  // Greetings
  if (/^(hi|hello|hey|good morning|good evening|good afternoon|howdy|sup|what'?s up)[\s!?.]*$/.test(msg.trim())) {
    return "Hey there! 👋 I'm HealthAI, your health companion. I can help you with health questions, symptoms, medications, nutrition, fitness, or anything wellness-related. What's on your mind?";
  }

  // How are you / small talk
  if (/how are you|how'?s it going|what are you|who are you/.test(msg)) {
    return "I'm doing great, thanks for asking! 😊 I'm HealthAI — think of me as a knowledgeable health friend. I'm here to answer your health questions, explain symptoms, suggest home remedies, and more. What can I help you with?";
  }

  if (/\bhead(ache)?s?\b|migraine/i.test(msg) && !msg.includes("healthcare")) {
    return "Headaches are really common! Here's what usually helps:\n\n1. **Hydrate** — dehydration is a top trigger. Drink a big glass of water right now.\n2. **Rest** — find a quiet, dimly lit room if possible.\n3. **Cold or warm compress** — cold on forehead, or warm on the back of the neck.\n4. **Over-the-counter relief** — ibuprofen (Advil) or acetaminophen (Tylenol) work well for most tension headaches.\n5. **Check triggers** — stress, poor sleep, skipped meals, or screen time are common culprits.\n\nSee a doctor if: headaches are sudden and severe, happen with fever/stiff neck, or keep coming back frequently.";
  }
  if (/fever|high temp|running a temp/.test(msg)) {
    return "For a fever, here's what to do:\n\n1. **Stay hydrated** — water, clear broths, sports drinks. Your body loses a lot of fluid.\n2. **Rest** — your immune system is working hard.\n3. **Light clothing** — don't bundle up; let your body release heat.\n4. **Medication** — acetaminophen (Tylenol) or ibuprofen (Advil) can reduce fever and discomfort. Follow dosage instructions.\n5. **Cool compress** on forehead can help with comfort.\n\n⚠️ Go to a doctor if: temperature exceeds 103°F (39.4°C), fever lasts more than 3 days, or comes with severe headache, rash, or difficulty breathing.";
  }
  if (/\bcough\b|runny nose|sneezing|common cold/.test(msg)) {
    return "Sounds like a cold or upper respiratory infection. Here's the playbook:\n\n1. **Rest up** — your body heals faster when you sleep.\n2. **Stay hydrated** — warm tea with honey, soup, or just water.\n3. **Honey & lemon** — a natural cough soother (don't give honey to children under 1).\n4. **Steam** — breathe steam from a hot shower or bowl of hot water to loosen congestion.\n5. **Salt water gargle** — ½ tsp salt in warm water, gargle for 30 seconds, helps sore throats.\n\nMost colds last 7–10 days. See a doctor if symptoms worsen after day 5 or you have a high fever.";
  }
  if (/stomach|nausea|vomit|diarrhea|digestive|gut/.test(msg)) {
    return "For stomach issues, try this:\n\n1. **BRAT diet** — Bananas, Rice, Applesauce, Toast. Easy on the stomach.\n2. **Small sips** — don't chug water; take small, frequent sips to stay hydrated without triggering nausea.\n3. **Ginger** — ginger tea or ginger candies are great for nausea.\n4. **Avoid** — dairy, fried foods, caffeine, and alcohol until you feel better.\n5. **Rest** — lying on your left side can help with nausea.\n\nSee a doctor if: you can't keep fluids down, have blood in stool/vomit, or severe abdominal pain.";
  }
  if (/sleep|insomnia|can'?t sleep|awake at night/.test(msg)) {
    return "Sleep issues are really frustrating. Here's what actually works:\n\n1. **Consistent schedule** — go to bed and wake up at the same time every day, even weekends.\n2. **No screens 1 hour before bed** — the blue light suppresses melatonin.\n3. **Cool room** — 65–68°F (18–20°C) is ideal for sleep.\n4. **Wind-down routine** — read, stretch, or take a warm bath before bed.\n5. **Limit caffeine** — avoid after 2 PM.\n6. **Try melatonin** — 0.5–3mg about 30 min before bed can help reset your sleep cycle.\n\nIf insomnia persists beyond 3 weeks, consider talking to a doctor about CBT-I (Cognitive Behavioral Therapy for Insomnia) — it's more effective than pills long-term.";
  }
  if (/back pain|backache/.test(msg)) {
    return "Back pain is one of the most common things people deal with. Here's what helps:\n\n1. **Ice first** — apply ice for the first 48-72 hours (20 min on, 20 min off).\n2. **Then heat** — after 2-3 days, switch to a heating pad to relax muscles.\n3. **Keep moving** — gentle walking is better than lying in bed. Complete rest can make it worse.\n4. **Ibuprofen** — reduces both pain and inflammation.\n5. **Stretch gently** — cat-cow stretch, knee-to-chest, and child's pose all help.\n\nSee a doctor if: pain shoots down your leg, you have numbness/tingling, or it doesn't improve in 2 weeks.";
  }
  if (/anxiety|stress|panic|overwhelmed|nervous/.test(msg)) {
    return "Anxiety and stress are real and manageable. Here's what helps:\n\n1. **Box breathing** — inhale 4 counts, hold 4, exhale 4, hold 4. Repeat 4 times. This directly calms your nervous system.\n2. **5-4-3-2-1 grounding** — name 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste. Brings you back to the present.\n3. **Exercise** — even a 20-min walk releases endorphins and reduces cortisol.\n4. **Limit caffeine** — it amplifies anxiety symptoms.\n5. **Progressive muscle relaxation** — tense and release each muscle group from feet to head.\n\nIf anxiety is significantly affecting your daily life, therapy (especially CBT) and/or speaking with a doctor can make a huge difference.";
  }
  if (/diabetes|blood sugar|glucose/.test(msg)) {
    return "**Diabetes** is a condition where the body can't properly regulate blood sugar (glucose).\n\n**Types:**\n- **Type 1** — the immune system destroys insulin-producing cells. Usually diagnosed young. Requires daily insulin.\n- **Type 2** — the body becomes resistant to insulin. Most common form, often linked to lifestyle.\n- **Gestational** — occurs during pregnancy.\n\n**Common symptoms:**\n- Frequent urination\n- Excessive thirst\n- Unexplained weight loss\n- Blurry vision\n- Slow-healing wounds\n- Fatigue\n- Tingling/numbness in hands or feet\n\n**Management:** Healthy diet (low refined sugar), regular exercise, weight management, and medication/insulin as prescribed.\n\nIf you suspect you have diabetes, a simple blood test (HbA1c or fasting glucose) from your doctor can confirm it.";
  }
  if (/blood pressure|hypertension|bp/.test(msg)) {
    return "**Blood pressure** measures the force of blood against artery walls. Normal is around 120/80 mmHg.\n\n**High blood pressure (hypertension):**\n- Often called the 'silent killer' — no symptoms until complications arise\n- Main risks: heart disease, stroke, kidney damage\n\n**How to lower it naturally:**\n1. Reduce sodium (salt) in your diet\n2. Exercise regularly — at least 30 min, 5 days/week\n3. Lose excess weight\n4. Quit smoking and limit alcohol\n5. Manage stress\n6. Eat potassium-rich foods (bananas, leafy greens)\n\nIf your reading is consistently above 130/80, speak with a doctor — medication is often very effective.";
  }
  if (/cholesterol|heart health|cardiovascular/.test(msg)) {
    return "**Cholesterol** is a waxy substance in blood. You need some, but too much LDL ('bad' cholesterol) clogs arteries.\n\n**To improve cholesterol:**\n1. **Eat more fiber** — oats, beans, fruits, and vegetables bind cholesterol\n2. **Healthy fats** — olive oil, avocados, nuts are good; trans fats are the enemy\n3. **Exercise** — raises HDL ('good' cholesterol)\n4. **Quit smoking** — it lowers HDL\n5. **Lose weight** — even 5–10% loss significantly improves levels\n6. **Omega-3s** — fatty fish (salmon, mackerel) 2x/week\n\nTotal cholesterol should ideally be below 200 mg/dL. A simple blood test checks this.";
  }

  // General wellness / generic
  return `Great question! Let me help with that.\n\nHealth topics can be complex, but here are some general wellness principles that apply broadly:\n\n1. **Stay hydrated** — aim for 8 glasses of water daily\n2. **Sleep 7–9 hours** — it affects nearly every aspect of health\n3. **Move daily** — even a 30-min walk makes a big difference\n4. **Eat more whole foods** — vegetables, fruits, lean protein, whole grains\n5. **Manage stress** — it has a surprisingly large impact on physical health\n\nCould you tell me more specifically what you'd like to know? For example: a specific symptom, condition, medication, or health goal? I can give you a much more useful answer that way! 😊`;
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
