import { HealthInsights } from "@/components/HealthInsights";

const Insights = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Health Insights</h1>
        <p className="text-muted-foreground">
          Explore health analytics, trends, and valuable insights from HealthAI consultations.
        </p>
      </div>
      <HealthInsights />
    </div>
  );
};

export default Insights;