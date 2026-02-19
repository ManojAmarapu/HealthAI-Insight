import { DiseasePredictionForm } from "@/components/DiseasePredictionForm";

const Predict = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Disease Prediction</h1>
        <p className="text-muted-foreground">
          Provide your symptoms and health information to get AI-powered insights about possible conditions.
        </p>
      </div>
      <DiseasePredictionForm />
    </div>
  );
};

export default Predict;