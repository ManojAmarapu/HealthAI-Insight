import { TreatmentSuggestions } from "@/components/TreatmentSuggestions";

const Treatment = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Treatment Guide</h1>
        <p className="text-muted-foreground">
          Get evidence-based treatment suggestions and first-aid guidance for common health conditions.
        </p>
      </div>
      <TreatmentSuggestions />
    </div>
  );
};

export default Treatment;