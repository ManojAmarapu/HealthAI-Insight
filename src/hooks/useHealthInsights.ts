import { useState, useRef, useEffect } from "react";
import { generateInsightsAI, HealthInsightsData } from "@/services/insightsEngine";
import { isGeminiAvailable } from "@/services/geminiClient";

export function useHealthInsights() {
  const [data, setData] = useState<HealthInsightsData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const abortRef = useRef<boolean>(false);

  // Cancel any in-flight request on unmount
  useEffect(() => {
    return () => {
      abortRef.current = true;
    };
  }, []);

  const generateInsights = async (userInput: string) => {
    if (!userInput.trim()) return;
    if (loading) return;

    abortRef.current = false;
    setLoading(true);

    try {
      // Use Gemini async call if available, otherwise falls back internally
      const insights = await generateInsightsAI(userInput);

      // Don't update state if component was unmounted
      if (!abortRef.current) {
        setData(insights);
      }
    } catch {
      if (!abortRef.current) {
        // Fallback already handled inside generateInsightsAI — this is a last resort
        setData(null);
      }
    } finally {
      if (!abortRef.current) {
        setLoading(false);
      }
    }
  };

  return { data, loading, generateInsights, isAIPowered: isGeminiAvailable() };
}
