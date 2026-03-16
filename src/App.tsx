import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OnboardingModal, useOnboarding } from "@/components/OnboardingModal";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useEffect, useState, useRef } from "react";
import Chat from "./pages/Chat";
import Predict from "./pages/Predict";
import Treatment from "./pages/Treatment";
import Insights from "./pages/Insights";
import BMI from "./pages/BMI";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const PAGE_TITLES: Record<string, string> = {
  "/": "AI Health Chat",
  "/predict": "Disease Predictor",
  "/treatment": "Treatment Guide",
  "/insights": "Health Insights",
  "/bmi": "BMI Calculator",
};

// Font size classes applied to <html>
const FONT_SIZES = ["text-sm", "text-base", "text-lg"] as const;
const FONT_LABELS = ["A-", "A", "A+"] as const;

// Scroll to top on every route change
function ScrollToTop() {
  const location = useLocation();
  useEffect(() => {
    // The main content area has overflow-auto, find and reset it
    const main = document.querySelector("main");
    if (main) main.scrollTop = 0;
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return null;
}

function PageTitle() {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] ?? "HealthAI";

  // Update browser tab title
  useEffect(() => {
    document.title = `${title} | HealthAI Insight`;
  }, [title]);

  return (
    <span className="text-sm font-semibold text-foreground truncate max-w-[140px] sm:max-w-none">
      {title}
    </span>
  );
}

const SIZE_OPTIONS = [
  { label: "Small",   desc: "Compact text",   cls: "text-sm",  preview: "Aa", idx: 0 },
  { label: "Regular", desc: "Default reading", cls: "text-base",preview: "Aa", idx: 1 },
  { label: "Large",   desc: "Easy on eyes",   cls: "text-lg", preview: "Aa", idx: 2 },
];

function FontSizeToggle() {
  const [sizeIdx, setSizeIdx] = useLocalStorage<number>("healthai_font_size", 1);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    FONT_SIZES.forEach(c => html.classList.remove(c));
    html.classList.add(FONT_SIZES[sizeIdx]);
  }, [sizeIdx]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Text size"
        className={`flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-lg border transition-all duration-200 ${
          open ? 'border-primary bg-primary/5' : 'border-border bg-background hover:bg-muted'
        }`}
      >
        <span className="text-sm font-bold leading-none text-foreground">Aa</span>
        {/* Dots showing current size */}
        <span className="flex gap-0.5">
          {SIZE_OPTIONS.map(o => (
            <span
              key={o.idx}
              className={`rounded-full transition-all duration-200 ${
                o.idx <= sizeIdx ? 'bg-primary w-1.5 h-1.5' : 'bg-muted w-1 h-1'
              }`}
            />
          ))}
        </span>
      </button>

      {/* Popover */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-150">
          <p className="text-[11px] font-medium text-muted-foreground px-2 pt-1 pb-1.5">Text Size</p>
          {SIZE_OPTIONS.map(opt => (
            <button
              key={opt.idx}
              onClick={() => { setSizeIdx(opt.idx); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                sizeIdx === opt.idx
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-muted text-foreground'
              }`}
            >
              <span className={`font-bold flex-shrink-0 ${opt.cls}`} style={{ lineHeight: 1 }}>Aa</span>
              <span className="flex-1 min-w-0">
                <span className="block text-xs font-semibold leading-tight">{opt.label}</span>
                <span className="block text-[10px] text-muted-foreground">{opt.desc}</span>
              </span>
              {sizeIdx === opt.idx && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AppLayout() {
  const { shouldShow: showOnboarding, complete: completeOnboarding } = useOnboarding();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Sidebar hidden on mobile — bottom nav handles navigation there */}
        <div className="hidden sm:block">
          <AppSidebar />
        </div>
        <div className="flex flex-col flex-1">
          {/* Header */}
          <header className="h-16 flex items-center justify-between px-3 sm:px-6 border-b bg-card shadow-soft sticky top-0 z-30">
            <div className="flex items-center gap-3">
              {/* Hide hamburger on mobile — bottom nav replaces sidebar there */}
              <SidebarTrigger className="hidden sm:flex p-2 hover:bg-muted rounded-lg transition-smooth" />
              <PageTitle />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 mr-2">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-medical">
                  <span className="text-primary-foreground font-bold text-sm">H</span>
                </div>
                <span className="font-semibold text-foreground hidden sm:inline">HealthAI</span>
              </div>
              <FontSizeToggle />
              <ThemeToggle />
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto pb-20 sm:pb-6">
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Chat />} />
              <Route path="/predict" element={<Predict />} />
              <Route path="/treatment" element={<Treatment />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/bmi" element={<BMI />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          {/* Medical Disclaimer Footer */}
          <footer className="border-t border-border bg-muted/40 px-4 sm:px-6 py-2 hidden sm:block">
            <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
              ⚕️ <strong>Medical Disclaimer:</strong> HealthAI provides general health information only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider.
            </p>
          </footer>

          {/* Mobile Bottom Navigation */}
          <MobileBottomNav />
        </div>
      </div>

      {/* Modals */}
      {showOnboarding && <OnboardingModal onComplete={completeOnboarding} />}
    </SidebarProvider>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
