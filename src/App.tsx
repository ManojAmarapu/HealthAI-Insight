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
import { useEffect, useState } from "react";
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

function FontSizeToggle() {
  const [sizeIdx, setSizeIdx] = useLocalStorage<number>("healthai_font_size", 1);

  useEffect(() => {
    const html = document.documentElement;
    FONT_SIZES.forEach(c => html.classList.remove(c));
    html.classList.add(FONT_SIZES[sizeIdx]);
  }, [sizeIdx]);

  return (
    <div className="flex items-center border border-border rounded-lg overflow-hidden" title="Font size">
      {FONT_SIZES.map((_, i) => (
        <button
          key={i}
          onClick={() => setSizeIdx(i)}
          className={`px-2 py-1 text-[11px] font-bold transition-colors ${
            i === sizeIdx
              ? "bg-primary text-primary-foreground"
              : "bg-background text-muted-foreground hover:bg-muted"
          }`}
        >
          {FONT_LABELS[i]}
        </button>
      ))}
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
