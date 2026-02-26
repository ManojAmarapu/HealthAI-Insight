export type SeverityLevel = "low" | "medium" | "high";

export const severityStyles: Record<SeverityLevel, string> = {
    low: "bg-green-500 text-white",
    medium: "bg-yellow-500 text-black",
    high: "bg-red-500 text-white",
};
