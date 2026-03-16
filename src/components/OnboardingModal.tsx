import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart, MessageCircle, Search, Stethoscope, TrendingUp, Calculator,
  ArrowRight, X, Check, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// ─── Tour steps: each navigates to a page and shows an overlay tooltip ─────
const TOUR_STEPS = [
  {
    path: "/",
    icon: MessageCircle,
    color: "from-blue-500 to-cyan-400",
    bgHint: "bg-blue-500/10",
    title: "AI Health Chat",
    tip: "Type any health question — symptoms, medications, nutrition, mental health — and get a conversational, helpful answer instantly. Try: \"I have a headache and fever, what should I do?\"",
    arrowSide: "bottom" as const,
  },
  {
    path: "/predict",
    icon: Search,
    color: "from-emerald-500 to-green-400",
    bgHint: "bg-emerald-500/10",
    title: "Disease Predictor",
    tip: "Select your symptoms from the list, enter your age and gender, then tap Predict. Our AI analyzes your symptom pattern and gives a confidence-rated assessment with next steps.",
    arrowSide: "bottom" as const,
  },
  {
    path: "/treatment",
    icon: Stethoscope,
    color: "from-purple-500 to-violet-400",
    bgHint: "bg-purple-500/10",
    title: "Treatment Guide",
    tip: "Describe your condition or search a disease. You'll get a step-by-step treatment plan with checkboxes to track your progress, estimated recovery time, and when to seek help.",
    arrowSide: "bottom" as const,
  },
  {
    path: "/insights",
    icon: TrendingUp,
    color: "from-orange-500 to-amber-400",
    bgHint: "bg-orange-500/10",
    title: "Health Insights",
    tip: "Enter your health situation and generate personalized insights, charts, and a Health Score (0–100). You can also set a health goal and track it right here.",
    arrowSide: "bottom" as const,
  },
  {
    path: "/bmi",
    icon: Calculator,
    color: "from-rose-500 to-pink-400",
    bgHint: "bg-rose-500/10",
    title: "BMI Calculator",
    tip: "Enter your weight and height in metric or imperial units. Get your BMI, category badge, visual gauge, and AI-generated personalized health tips based on your result.",
    arrowSide: "bottom" as const,
  },
];

interface Props {
  onComplete: () => void;
}

export function OnboardingModal({ onComplete }: Props) {
  // Phase 0 = username collection, Phase 1+ = tour steps
  const [phase, setPhase] = useState<"name" | "tour">("name");
  const [tourStep, setTourStep] = useState(0);
  const [nameInput, setNameInput] = useState("");
  const [, setStoredName] = useLocalStorage<string>("healthai_user_name", "");
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus name input on mount
  useEffect(() => {
    if (phase === "name") setTimeout(() => inputRef.current?.focus(), 200);
  }, [phase]);

  const handleNameSubmit = () => {
    const name = nameInput.trim();
    if (name) setStoredName(name);
    setPhase("tour");
    navigate(TOUR_STEPS[0].path);
  };

  const handleNext = () => {
    const next = tourStep + 1;
    if (next >= TOUR_STEPS.length) {
      onComplete();
      return;
    }
    setTourStep(next);
    navigate(TOUR_STEPS[next].path);
  };

  const handleSkip = () => {
    const name = nameInput.trim();
    if (name) setStoredName(name);
    onComplete();
  };

  /* ── PHASE: Username ──────────────────────────────────────────────── */
  if (phase === "name") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
        <div className="bg-card border border-border rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in-90 duration-300">
          {/* Gradient header */}
          <div className="bg-gradient-to-br from-primary via-primary/80 to-cyan-500 p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_50%,white,transparent)]" />
            <div className="relative w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/30">
              <Heart className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white relative">Welcome to HealthAI! 👋</h1>
            <p className="text-white/80 text-sm mt-2 relative">Your AI-powered health companion</p>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <p className="text-foreground font-semibold mb-1">What should we call you?</p>
              <p className="text-muted-foreground text-sm">We'll personalise your experience with your name.</p>
            </div>
            <div className="relative">
              <Input
                ref={inputRef}
                placeholder="Enter your first name"
                value={nameInput}
                onChange={e => setNameInput(e.target.value.slice(0, 30))}
                onKeyDown={e => e.key === "Enter" && handleNameSubmit()}
                className="h-12 text-base rounded-xl"
              />
            </div>
            <Button
              onClick={handleNameSubmit}
              className="w-full h-11 rounded-xl text-base font-semibold gap-2 bg-primary hover:bg-primary/90"
            >
              {nameInput.trim() ? `Let's go, ${nameInput.trim()}!` : "Start Tour"} <ArrowRight className="w-4 h-4" />
            </Button>
            <button onClick={handleSkip} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
              Skip and explore on my own
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── PHASE: Tour ───────────────────────────────────────────────────── */
  const step = TOUR_STEPS[tourStep];
  const StepIcon = step.icon;
  const isLast = tourStep === TOUR_STEPS.length - 1;
  const displayName = nameInput.trim();

  return (
    <>
      {/* Dimmed backdrop — doesn't cover bottom 72px (nav bar area) */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
        onClick={handleSkip}
        style={{ bottom: "72px" }}
      />

      {/* Tour card — bottom sheet on mobile, centered on desktop */}
      <div className="fixed bottom-20 left-0 right-0 z-50 px-4 pb-2 sm:static sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-4 sm:pointer-events-none">
        <div
          className="bg-card border border-border rounded-2xl shadow-2xl w-full sm:max-w-md overflow-hidden animate-in slide-in-from-bottom-4 sm:animate-in sm:fade-in sm:zoom-in-95 duration-300 sm:pointer-events-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Progress bar */}
          <div className="flex gap-1 p-4 pb-0">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full flex-1 transition-all duration-500 ${
                  i < tourStep ? "bg-primary/50" : i === tourStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <div className="p-5 flex gap-4">
            {/* Icon */}
            <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center bg-gradient-to-br ${step.color}`}>
              <StepIcon className="w-6 h-6 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                    Step {tourStep + 1} of {TOUR_STEPS.length}
                  </p>
                  <h3 className="font-bold text-foreground text-base leading-tight">{step.title}</h3>
                </div>
                <button onClick={handleSkip} className="text-muted-foreground hover:text-foreground transition-colors mt-0.5 flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.tip}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="px-5 pb-5 flex items-center justify-between gap-3">
            <button
              onClick={handleSkip}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip tour
            </button>
            <div className="flex items-center gap-2">
              {/* Step dots */}
              <div className="flex gap-1">
                {TOUR_STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setTourStep(i); navigate(TOUR_STEPS[i].path); }}
                    className={`rounded-full transition-all duration-300 ${
                      i === tourStep ? "w-4 h-2 bg-primary" : "w-2 h-2 bg-muted hover:bg-muted-foreground/40"
                    }`}
                  />
                ))}
              </div>
              <Button
                onClick={handleNext}
                size="sm"
                className="gap-1.5 rounded-xl h-9 px-4 bg-primary hover:bg-primary/90"
              >
                {isLast ? (
                  <><Check className="w-3.5 h-3.5" /> {displayName ? `Done, ${displayName}!` : "Done!"}</>
                ) : (
                  <>Next <ChevronRight className="w-3.5 h-3.5" /></>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/** Hook — returns whether onboarding should be shown */
export function useOnboarding() {
  const [seen, setSeen] = useLocalStorage("healthai_onboarding_seen", false);
  const complete = () => setSeen(true);
  return { shouldShow: !seen, complete };
}
