import { useState } from "react";
import { generateCustomInsights, HealthInsightsData } from "@/services/insightsEngine";

export function useHealthInsights() {
    const [data, setData] = useState<HealthInsightsData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const generateInsights = (userInput: string) => {
        if (!userInput.trim()) return;

        setLoading(true);

        // Simulate AI processing
        setTimeout(() => {
            const insights = generateCustomInsights(userInput);

            setData(insights);
            setLoading(false);
        }, 2000);
    };

    return { data, loading, generateInsights };
}
