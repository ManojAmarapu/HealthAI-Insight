import { useState } from "react";
import { Heart, Search, Stethoscope, TrendingUp, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const STEPS = [
  {
    icon: Heart,
    color: "text-primary bg-primary/10",
    title: "Welcome to HealthAI! 👋",
    description: "Your AI-powered health companion — here to answer health questions, analyze symptoms, and provide personalized guidance. Let's show you around.",
  },
  {
    icon: Search,
    color: "text-emerald-600 bg-emerald-50",
    title: "Disease Predictor",
    description: "Select your symptoms and get an AI-powered prediction of possible conditions with confidence scores and personalized recommendations.",
  },
  {
    icon: Stethoscope,
    color: "text-purple-600 bg-purple-50",
    title: "Treatment Guide & Health Insights",
    description: "Get step-by-step treatment guidance for any condition, or explore your personalized health insights and analytics dashboard.",
  },
  {
    icon: TrendingUp,
    color: "text-orange-500 bg-orange-50",
    title: "You're all set!",
    description: "HealthAI is powered by Google Gemini AI. All information is for general guidance only — always consult a healthcare professional for medical decisions.",
  },
];

interface Props {
  onComplete: () => void;
}

export function OnboardingModal({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-in fade-in zoom-in-95 duration-300">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 text-muted-foreground h-7 w-7 p-0"
          onClick={onComplete}
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Step indicator */}
        <div className="flex gap-1.5 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? "bg-primary flex-1" : i < step ? "bg-primary/40 w-3" : "bg-muted w-3"
              }`}
            />
          ))}
        </div>

        {/* Icon */}
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${current.color}`}>
          <Icon className="w-8 h-8" />
        </div>

        {/* Content */}
        <h2 className="text-xl font-bold text-foreground mb-3">{current.title}</h2>
        <p className="text-muted-foreground leading-relaxed mb-8">{current.description}</p>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={onComplete}
          >
            Skip tour
          </button>
          <Button
            onClick={() => isLast ? onComplete() : setStep(s => s + 1)}
            className="gap-2"
          >
            {isLast ? "Get Started" : "Next"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Hook — returns whether onboarding should be shown */
export function useOnboarding() {
  const [seen, setSeen] = useLocalStorage("healthai_onboarding_seen", false);
  const complete = () => setSeen(true);
  return { shouldShow: !seen, complete };
}
