import { SeverityLevel } from "@/constants/severityLevels";
import { isGeminiAvailable, getGeminiModel } from "./geminiClient";

export interface PredictionResult {
  disease: string;
  probability: number;
  reasoning: string;
  severity: SeverityLevel;
  recommendations: string[];
}

// ─── Gemini-powered analysis ─────────────────────────────────────────────────
export const analyzeSymptomsWithGemini = async (
  symptoms: string[],
  age: number,
  gender: string,
  duration?: string,
  severityInput?: string
): Promise<PredictionResult> => {
  const prompt = `You are a medical AI assistant. Analyze the following patient information and provide a structured health assessment.

Patient Profile:
- Age: ${age} years old
- Gender: ${gender}
- Reported Symptoms: ${symptoms.join(", ")}
- Symptom Duration: ${duration || "not specified"}
- Self-reported Severity: ${severityInput || "not specified"}

Return ONLY a valid JSON object (no markdown, no extra text) in this exact format:
{
  "disease": "Most likely condition name",
  "probability": <number 0-100>,
  "reasoning": "Brief clinical reasoning (2-3 sentences)",
  "severity": "<low|medium|high>",
  "recommendations": [
    "Specific recommendation 1",
    "Specific recommendation 2",
    "Specific recommendation 3",
    "Specific recommendation 4"
  ]
}

Rules:
- severity must be exactly "low", "medium", or "high"
- probability must be a number between 0 and 100
- Always include a medical disclaimer in the last recommendation
- If symptoms suggest emergency (chest pain + shortness of breath, signs of stroke, etc.), set severity to "high" and first recommendation must be "SEEK IMMEDIATE MEDICAL ATTENTION - Call emergency services"`;

  try {
    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Strip markdown code blocks if present
    const jsonText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(jsonText) as PredictionResult;

    // Validate severity field
    if (!["low", "medium", "high"].includes(parsed.severity)) {
      parsed.severity = "medium";
    }
    // Validate probability
    parsed.probability = Math.min(100, Math.max(0, Number(parsed.probability) || 60));

    return parsed;
  } catch (err) {
    console.error("[HealthAI] Gemini prediction error, using fallback:", err);
    return analyzeSymptoms(symptoms, age, gender);
  }
};

// ─── Rule-based fallback (synchronous) ───────────────────────────────────────
export const analyzeSymptoms = (symptoms: string[], age: number, gender: string): PredictionResult => {
  const symptomSet = new Set(symptoms.map((s) => s.toLowerCase()));
  const isElderly = age >= 65;
  const isChild = age <= 12;

  if (symptomSet.has("chest pain") && symptomSet.has("shortness of breath")) {
    return {
      disease: "Possible Cardiac/Respiratory Issue",
      probability: isElderly ? 85 : 70,
      reasoning: `Chest pain with shortness of breath requires immediate medical evaluation to rule out serious conditions.${isElderly ? " The risk is elevated given your age group." : ""}`,
      severity: "high",
      recommendations: [
        "SEEK IMMEDIATE MEDICAL ATTENTION",
        "Call emergency services if symptoms are severe",
        "Do not drive yourself to the hospital",
        "Have someone accompany you to medical facility",
      ],
    };
  }
  if (symptomSet.has("fever") && symptomSet.has("cough") && symptomSet.has("sore throat")) {
    const childNote = isChild ? " For children, always consult a paediatrician before giving any medication." : "";
    return {
      disease: "Common Cold/Flu",
      probability: 85,
      reasoning: `The combination of fever, cough, and sore throat are classic symptoms of viral upper respiratory infections.${childNote}`,
      severity: "medium",
      recommendations: [
        "Get plenty of rest and stay hydrated",
        "Use throat lozenges for sore throat relief",
        `Monitor temperature and seek medical care if fever exceeds ${isChild ? "100.4°F (38°C)" : "103°F (39.4°C)"}`,
        isChild
          ? "Do NOT give aspirin to children — use paediatric acetaminophen as directed"
          : "Consider over-the-counter pain relievers as needed",
      ],
    };
  }
  if (symptomSet.has("headache") && symptomSet.has("nausea") && symptomSet.has("dizziness")) {
    return {
      disease: "Migraine",
      probability: 75,
      reasoning: "Headache combined with nausea and dizziness suggests a possible migraine episode.",
      severity: "medium",
      recommendations: [
        "Rest in a dark, quiet room",
        "Apply cold compress to forehead",
        "Stay hydrated and avoid known triggers",
        "Consider consulting a neurologist if episodes are frequent",
      ],
    };
  }
  if (symptomSet.has("abdominal pain") && symptomSet.has("nausea") && symptomSet.has("vomiting")) {
    return {
      disease: "Gastroenteritis",
      probability: 80,
      reasoning: "Abdominal pain with nausea and vomiting indicates possible gastroenteritis or stomach flu.",
      severity: "medium",
      recommendations: [
        "Stay hydrated with clear fluids",
        "Follow the BRAT diet (Bananas, Rice, Applesauce, Toast)",
        "Avoid dairy and fatty foods temporarily",
        "Seek medical attention if symptoms persist beyond 48 hours",
      ],
    };
  }

  const elderlyNote = isElderly ? " At your age, it is important to see a doctor sooner rather than later to rule out underlying conditions." : "";
  const genderNote = gender === "female" ? " Some symptoms in women can present differently from typical presentations; please consult a doctor if symptoms persist." : "";

  // BUG-11: Actually scale probability and severity based on age
  let baseProbability = 60;
  if (isElderly) baseProbability += 15;
  if (isChild) baseProbability += 10;

  return {
    disease: "General Viral Infection",
    probability: baseProbability,
    reasoning: `Based on the symptoms provided, this appears to be a mild viral infection or general malaise.${elderlyNote}${genderNote}`,
    severity: isElderly || isChild ? "medium" : "low",
    recommendations: [
      "Get adequate rest and sleep",
      "Stay well hydrated",
      "Monitor symptoms for any changes",
      isElderly || isChild
        ? "Consult your healthcare provider promptly if symptoms do not improve within 24 hours"
        : "Consult healthcare provider if symptoms worsen or persist",
    ],
  };
};

// ─── Main export: auto-selects Gemini or fallback ────────────────────────────
export const analyzeSymptomsAI = async (
  symptoms: string[],
  age: number,
  gender: string,
  duration?: string,
  severityInput?: string
): Promise<PredictionResult> => {
  if (isGeminiAvailable()) {
    return analyzeSymptomsWithGemini(symptoms, age, gender, duration, severityInput);
  }
  return analyzeSymptoms(symptoms, age, gender);
};
