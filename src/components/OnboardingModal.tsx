import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageCircle, Search, Stethoscope, TrendingUp, Calculator,
  ChevronRight, ChevronLeft, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// ─── Tour steps ────────────────────────────────────────────────────────────────
const TOUR_STEPS = [
  {
    path: "/",
    icon: MessageCircle,
    gradient: "from-blue-500 to-cyan-400",
    color: "#3B82F6",
    title: "AI Health Chat",
    tip: "Type any health question — symptoms, medications, nutrition, mental health — and get a conversational, helpful answer instantly. Try: \"I have a headache and fever, what should I do?\"",
  },
  {
    path: "/predict",
    icon: Search,
    gradient: "from-emerald-500 to-green-400",
    color: "#10B981",
    title: "Disease Predictor",
    tip: "Select your symptoms from the list, enter your age and gender, then tap Predict. Our AI analyzes your symptom pattern and gives a confidence-rated assessment with next steps.",
  },
  {
    path: "/treatment",
    icon: Stethoscope,
    gradient: "from-purple-500 to-violet-400",
    color: "#8B5CF6",
    title: "Treatment Guide",
    tip: "Describe your condition or search a disease. You'll get a step-by-step treatment plan with checkboxes to track your progress, estimated recovery time, and when to seek help.",
  },
  {
    path: "/insights",
    icon: TrendingUp,
    gradient: "from-orange-500 to-amber-400",
    color: "#F59E0B",
    title: "Health Insights",
    tip: "Enter your health situation and generate personalized insights, charts, and a Health Score (0–100). Set a health goal and track it right here.",
  },
  {
    path: "/bmi",
    icon: Calculator,
    gradient: "from-rose-500 to-pink-400",
    color: "#F43F5E",
    title: "BMI Calculator",
    tip: "Enter your weight and height in metric or imperial. Get your BMI, category badge, visual gauge, and AI-generated personalized health tips based on your result.",
  },
];

interface Props {
  onComplete: () => void;
}

export function OnboardingModal({ onComplete }: Props) {
  const [phase, setPhase] = useState<"name" | "tour">("name");
  const [tourStep, setTourStep] = useState(0);
  const [nameInput, setNameInput] = useState("");
  const [, setStoredName] = useLocalStorage<string>("healthai_user_name", "");
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (phase === "name") setTimeout(() => inputRef.current?.focus(), 200);
  }, [phase]);

  const startTour = () => {
    const name = nameInput.trim();
    if (name) setStoredName(name);
    setPhase("tour");
    navigate(TOUR_STEPS[0].path);
  };

  const goNext = () => {
    const next = tourStep + 1;
    if (next >= TOUR_STEPS.length) {
      // Last step "Got it" → back to Chat
      onComplete();
      navigate("/");
    } else {
      setTourStep(next);
      navigate(TOUR_STEPS[next].path);
    }
  };

  const goBack = () => {
    const prev = tourStep - 1;
    if (prev >= 0) {
      setTourStep(prev);
      navigate(TOUR_STEPS[prev].path);
    }
  };

  const handleSkip = () => {
    const name = nameInput.trim();
    if (name) setStoredName(name);
    onComplete();
    navigate("/");
  };

  /* ── PHASE: Username ──────────────────────────────────────────────────────── */
  if (phase === "name") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-card border border-border rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in-90 duration-300">
          <div className="bg-gradient-to-br from-primary via-primary/80 to-cyan-500 p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_50%,white,transparent)]" />
            <div className="relative w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/30">
              <span className="text-3xl">👋</span>
            </div>
            <h1 className="text-2xl font-bold text-white relative">Welcome to HealthAI!</h1>
            <p className="text-white/80 text-sm mt-2 relative">Your AI-powered health companion</p>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <p className="text-foreground font-semibold mb-1">What should we call you?</p>
              <p className="text-muted-foreground text-sm">We'll personalise your experience with your name.</p>
            </div>
            <Input
              ref={inputRef}
              placeholder="Enter your first name"
              value={nameInput}
              onChange={e => setNameInput(e.target.value.slice(0, 30))}
              onKeyDown={e => e.key === "Enter" && startTour()}
              className="h-12 text-base rounded-xl"
            />
            <Button
              onClick={startTour}
              className="w-full h-11 rounded-xl text-base font-semibold gap-2 bg-primary hover:bg-primary/90"
            >
              {nameInput.trim() ? `Let's go, ${nameInput.trim()}! 🚀` : "Start Tour →"}
            </Button>
            <button onClick={handleSkip} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
              Skip and explore on my own
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── PHASE: Tour — floating tooltip, NO backdrop ─────────────────────────── */
  const step = TOUR_STEPS[tourStep];
  const StepIcon = step.icon;
  const isLast = tourStep === TOUR_STEPS.length - 1;
  const isFirst = tourStep === 0;
  const displayName = nameInput.trim();

  return (
    /* Fixed bottom-right floating card — NO background overlay, NO blur */
    <div
      className="fixed bottom-24 right-4 z-50 w-80 animate-in slide-in-from-bottom-3 fade-in duration-300"
      style={{ filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.18))" }}
    >
      {/* Arrow pointing up-right toward sidebar nav */}
      <div
        className="absolute -top-2.5 right-10 w-5 h-3 overflow-hidden"
        style={{ filter: "drop-shadow(0 -2px 1px rgba(0,0,0,0.08))" }}
      >
        <div
          className="w-4 h-4 rotate-45 translate-y-1.5 ml-0.5"
          style={{ background: step.color }}
        />
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Colored top accent bar */}
        <div
          className={`h-1 bg-gradient-to-r ${step.gradient}`}
        />

        {/* Progress dots */}
        <div className="flex gap-1.5 px-4 pt-3">
          {TOUR_STEPS.map((s, i) => (
            <div
              key={i}
              className="flex-1 h-1 rounded-full transition-all duration-400"
              style={{
                background: i <= tourStep ? step.color : undefined,
                backgroundColor: i <= tourStep ? step.color : "hsl(var(--muted))",
                opacity: i < tourStep ? 0.4 : i === tourStep ? 1 : 0.25,
              }}
            />
          ))}
        </div>

        {/* Body */}
        <div className="p-4">
          <div className="flex items-start gap-3 mb-3">
            {/* Icon */}
            <div
              className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center bg-gradient-to-br ${step.gradient} shadow-sm`}
            >
              <StepIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                Step {tourStep + 1} of {TOUR_STEPS.length}
              </p>
              <h3 className="font-bold text-foreground text-sm leading-tight">{step.title}</h3>
            </div>
            {/* Close X */}
            <button
              onClick={handleSkip}
              className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed mb-4">{step.tip}</p>

          {/* Buttons */}
          <div className="flex items-center justify-between gap-2">
            {/* Skip */}
            <button
              onClick={handleSkip}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip tour
            </button>

            <div className="flex items-center gap-2">
              {/* Back */}
              {!isFirst && (
                <button
                  onClick={goBack}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg hover:bg-muted border border-border"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Back
                </button>
              )}

              {/* Next / Got it */}
              <Button
                onClick={goNext}
                size="sm"
                className="h-8 px-4 text-xs font-semibold rounded-xl gap-1"
                style={{ background: step.color }}
              >
                {isLast ? (
                  "Got it! ✓"
                ) : (
                  <>Next <ChevronRight className="w-3.5 h-3.5" /></>
                )}
              </Button>
            </div>
          </div>
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
