import { useState, useRef, useEffect } from "react";
import { generateCustomInsights, HealthInsightsData } from "@/services/insightsEngine";

export function useHealthInsights() {
    const [data, setData] = useState<HealthInsightsData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    // BUG-04: store timer ref for cleanup
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // BUG-04: clean up on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const generateInsights = (userInput: string) => {
        if (!userInput.trim()) return;
        // BUG-14: Guard against double invocation while already loading
        if (loading) return;

        setLoading(true);

        timerRef.current = setTimeout(() => {
            const insights = generateCustomInsights(userInput);
            setData(insights);
            setLoading(false);
            timerRef.current = null;
        }, 2000);
    };

    return { data, loading, generateInsights };
}
