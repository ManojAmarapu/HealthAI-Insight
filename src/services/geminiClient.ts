import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Check if a real API key is configured (not the placeholder)
export const isGeminiAvailable = (): boolean => {
  return !!API_KEY && API_KEY !== "your_gemini_api_key_here" && API_KEY.length > 10;
};

// Singleton Gemini client
let genAI: GoogleGenerativeAI | null = null;

const getGenAI = (): GoogleGenerativeAI => {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(API_KEY);
  }
  return genAI;
};

// Safety settings — tuned permissively for a medical information app
const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];

// Returns a configured Gemini model instance
export const getGeminiModel = () => {
  return getGenAI().getGenerativeModel({
    model: "gemini-2.0-flash",
    safetySettings: SAFETY_SETTINGS,
  });
};

// Shared system instruction for all health-related prompts
export const HEALTH_SYSTEM_INSTRUCTION = `You are HealthAI, a knowledgeable and empathetic AI healthcare assistant. 
You provide clear, accurate, and helpful general health information and guidance.
IMPORTANT RULES:
- Always remind users to consult qualified healthcare professionals for diagnosis and treatment
- Never claim to diagnose or replace professional medical advice
- For emergency symptoms (chest pain, difficulty breathing, severe bleeding), always advise calling emergency services immediately
- Be compassionate and clear in your language
- Keep responses concise and actionable`;
