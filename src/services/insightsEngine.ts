import { isGeminiAvailable, getGeminiModel } from "./geminiClient";

export interface HealthInsightsData {
  userQuery: string;
  recommendations: string[];
  riskFactors: string[];
  preventiveMeasures: string[];
  lifestyle: string[];
  isGeneric?: boolean;
}

// ─── Gemini-powered insights ─────────────────────────────────────────────────
export const generateCustomInsightsWithGemini = async (
  userInput: string
): Promise<HealthInsightsData> => {
  const prompt = `You are HealthAI, a knowledgeable health insights assistant.

The user has described their health concern or goal as: "${userInput}"

Return ONLY a valid JSON object (no markdown, no extra text) in this exact format:
{
  "userQuery": "${userInput}",
  "recommendations": [
    "Specific recommendation 1",
    "Specific recommendation 2",
    "Specific recommendation 3",
    "Specific recommendation 4",
    "Specific recommendation 5"
  ],
  "riskFactors": [
    "Risk factor 1",
    "Risk factor 2",
    "Risk factor 3",
    "Risk factor 4",
    "Risk factor 5"
  ],
  "preventiveMeasures": [
    "Preventive measure 1",
    "Preventive measure 2",
    "Preventive measure 3",
    "Preventive measure 4"
  ],
  "lifestyle": [
    "Lifestyle tip 1",
    "Lifestyle tip 2",
    "Lifestyle tip 3",
    "Lifestyle tip 4"
  ]
}

Rules:
- Make all advice SPECIFIC to the user's concern: "${userInput}"
- Be practical, evidence-based, and actionable
- Keep each item concise (max 1 sentence)
- Do NOT include generic filler — everything must be relevant to their specific query`;

  try {
    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(jsonText) as HealthInsightsData;
    parsed.isGeneric = false;
    return parsed;
  } catch (err) {
    console.error("[HealthAI] Gemini insights error, using fallback:", err);
    return generateCustomInsights(userInput);
  }
};

// ─── Rule-based fallback (synchronous) ───────────────────────────────────────
export const generateCustomInsights = (userInput: string): HealthInsightsData => {
  const input = userInput.toLowerCase();

  if (input.includes("heart") || input.includes("cardiac") || input.includes("chest")) {
    return {
      userQuery: userInput,
      recommendations: ["Monitor blood pressure regularly", "Maintain a heart-healthy diet low in sodium", "Exercise for 30 minutes daily", "Limit alcohol consumption", "Quit smoking if applicable"],
      riskFactors: ["High cholesterol", "High blood pressure", "Sedentary lifestyle", "Smoking", "Family history"],
      preventiveMeasures: ["Regular cardiovascular checkups", "Stress management techniques", "Mediterranean diet", "Adequate sleep (7-9 hours)"],
      lifestyle: ["Walk 10,000 steps daily", "Practice deep breathing", "Stay hydrated", "Limit processed foods"],
    };
  }
  if (input.includes("diabetes") || input.includes("blood sugar") || input.includes("glucose") || input.includes("insulin")) {
    return {
      userQuery: userInput,
      recommendations: ["Monitor blood glucose levels regularly", "Follow a balanced, low-carb diet", "Exercise regularly to improve insulin sensitivity", "Take medications as prescribed", "Maintain a healthy weight"],
      riskFactors: ["Obesity", "Family history of diabetes", "Sedentary lifestyle", "High blood pressure", "Age over 45"],
      preventiveMeasures: ["Regular HbA1c testing", "Annual eye exams", "Foot care routine", "Blood pressure monitoring"],
      lifestyle: ["Meal planning and portion control", "Regular sleep schedule", "Stress reduction activities", "Stay hydrated with water"],
    };
  }
  if (input.includes("sleep") || input.includes("insomnia") || input.includes("fatigue") || input.includes("tired")) {
    return {
      userQuery: userInput,
      recommendations: ["Maintain a consistent sleep schedule", "Create a relaxing bedtime routine", "Limit caffeine after 2 PM", "Avoid screens 1 hour before bed", "Keep bedroom cool, dark, and quiet"],
      riskFactors: ["Irregular sleep schedule", "High stress or anxiety", "Excessive caffeine or alcohol", "Screen time before bed", "Underlying sleep disorders"],
      preventiveMeasures: ["Sleep hygiene education", "CBT-I therapy if needed", "Regular physical activity", "Stress management practices"],
      lifestyle: ["Practice relaxation techniques before bed", "Use blue-light-blocking glasses in the evening", "Spend time in natural light daily", "Avoid naps longer than 20 minutes"],
    };
  }
  if (input.includes("weight") || input.includes("obesity") || input.includes("diet") || input.includes("nutrition")) {
    return {
      userQuery: userInput,
      recommendations: ["Aim for gradual weight loss (0.5–1 kg per week)", "Increase vegetables and fibre-rich foods", "Reduce ultra-processed food and sugary drinks", "Practice mindful eating", "Consult a registered dietitian"],
      riskFactors: ["High-calorie, low-nutrient diet", "Sedentary lifestyle", "Hormonal imbalances", "Emotional eating", "Genetic factors"],
      preventiveMeasures: ["Regular health weight-ins", "Tracking food intake", "Annual metabolic panel tests", "Setting realistic, sustainable goals"],
      lifestyle: ["Cook more meals at home", "Choose stairs over lifts", "Eat slowly and without distractions", "Plan meals ahead"],
    };
  }
  if (input.includes("mental") || input.includes("anxiety") || input.includes("stress") || input.includes("depression") || input.includes("mood")) {
    return {
      userQuery: userInput,
      recommendations: ["Speak with a licensed mental health professional", "Practice mindfulness or meditation daily", "Maintain social connections", "Establish a consistent daily routine", "Limit news and social media"],
      riskFactors: ["Chronic stress", "Social isolation", "Poor sleep", "Lack of physical activity", "Unhealthy coping mechanisms"],
      preventiveMeasures: ["Regular therapy or counselling", "Stress-reduction techniques", "Annual mental health check-ins", "Building a support network"],
      lifestyle: ["Exercise 30 minutes most days", "Journal thoughts and feelings", "Spend time in nature", "Prioritise sleep"],
    };
  }

  return {
    // BUG-10: Display the specific topic back to the user to acknowledge we read it
    userQuery: `General wellness insights for: ${userInput}`,
    isGeneric: true,
    recommendations: ["Maintain a balanced diet with fruits and vegetables", "Exercise regularly for overall fitness", "Get adequate sleep (7-9 hours nightly)", "Stay hydrated throughout the day", "Schedule regular health checkups"],
    riskFactors: ["Sedentary lifestyle", "Poor diet habits", "Chronic stress", "Lack of sleep", "Smoking or excessive alcohol"],
    preventiveMeasures: ["Annual health screenings", "Vaccination updates", "Mental health check-ins", "Preventive dental care"],
    lifestyle: ["Practice mindfulness or meditation", "Social connections and support", "Limit screen time before bed", "Spend time outdoors daily"],
  };
};

// ─── Main export: auto-selects Gemini or fallback ────────────────────────────
export const generateInsightsAI = async (userInput: string): Promise<HealthInsightsData> => {
  if (isGeminiAvailable()) {
    return generateCustomInsightsWithGemini(userInput);
  }
  return generateCustomInsights(userInput);
};
