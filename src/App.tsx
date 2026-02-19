import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import Predict from "./pages/Predict";
import Treatment from "./pages/Treatment";
import Insights from "./pages/Insights";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-background">
            <AppSidebar />
            
            <div className="flex flex-col flex-1">
              {/* Header */}
              <header className="h-16 flex items-center justify-between px-6 border-b bg-card shadow-soft">
                <SidebarTrigger className="p-2 hover:bg-muted rounded-lg transition-smooth" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-medical">
                    <span className="text-primary-foreground font-bold text-sm">H</span>
                  </div>
                  <span className="font-semibold text-foreground">HealthAI</span>
                </div>
              </header>

              {/* Main Content */}
              <main className="flex-1 p-6 overflow-auto">
                <Routes>
                  <Route path="/" element={<Chat />} />
                  <Route path="/predict" element={<Predict />} />
                  <Route path="/treatment" element={<Treatment />} />
                  <Route path="/insights" element={<Insights />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
