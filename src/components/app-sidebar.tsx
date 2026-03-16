import { useEffect } from "react";
import { 
  MessageCircle, 
  Search, 
  Stethoscope, 
  TrendingUp, 
  Heart,
  Calculator,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "AI Chat", url: "/", icon: MessageCircle, description: "Ask health questions" },
  { title: "Disease Predictor", url: "/predict", icon: Search, description: "Predict possible conditions" },
  { title: "Treatment Guide", url: "/treatment", icon: Stethoscope, description: "Get treatment suggestions" },
  { title: "Health Insights", url: "/insights", icon: TrendingUp, description: "View health analytics" },
  { title: "BMI Calculator", url: "/bmi", icon: Calculator, description: "Calculate your BMI" },
];

const HEALTH_TIPS = [
  "Drink 8 glasses of water daily to stay hydrated.",
  "Aim for 7–9 hours of sleep each night.",
  "Walk at least 10,000 steps per day.",
  "Eat 5 servings of fruits and vegetables daily.",
  "Take a 5-minute stretch break every hour.",
  "Limit screen time 1 hour before bed.",
  "Practice deep breathing for 5 minutes daily.",
  "Floss your teeth every night before bed.",
  "Replace one sugary drink with water today.",
  "Wash your hands for at least 20 seconds.",
  "Apply sunscreen SPF 30+ when going outdoors.",
  "Eat a protein-rich breakfast to fuel your day.",
  "Take the stairs instead of the elevator.",
  "Meditate for 10 minutes each morning.",
  "Limit sodium intake to under 2300mg per day.",
  "Eat fish twice a week for omega-3 benefits.",
  "Stand up and move for 2 minutes every 30 min.",
  "Limit alcohol to one drink per day.",
  "Add a handful of nuts to your daily diet.",
  "Check your blood pressure monthly.",
  "Laugh daily — it boosts immunity!",
  "Eat slowly and chew food thoroughly.",
  "Keep a health journal to track symptoms.",
  "Schedule an annual physical exam.",
  "Reduce processed food intake this week.",
  "Connect with a friend or family member today.",
  "Try yoga for 20 minutes to reduce stress.",
  "Keep your bedroom cool (18-20°C) for better sleep.",
  "Eat dark chocolate (70%+) for antioxidants.",
  "Volunteer — it's proven to improve mental health.",
];

const getDailyTip = () => HEALTH_TIPS[new Date().getDate() % HEALTH_TIPS.length];

export function AppSidebar() {
  const { state, setOpenMobile } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';

  // Auto-close sidebar on mobile whenever the route changes
  useEffect(() => {
    setOpenMobile(false);
  }, [location.pathname, setOpenMobile]);

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-gradient-primary text-primary-foreground shadow-medical" 
      : "hover:bg-muted/60 transition-smooth";

  return (
    <Sidebar
      className="border-r bg-card"
      collapsible="offcanvas"
    >
      <SidebarContent className="p-4">
        {/* Logo Section */}
          <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-medical">
            <Heart className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">HealthAI</h1>
            <p className="text-sm text-muted-foreground">Your AI Health Assistant</p>
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground font-medium mb-4">
            Main Navigation
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-auto p-0">
                    <NavLink 
                      to={item.url} 
                      end 
                      className={`${getNavCls({ isActive: isActive(item.url) })} 
                        flex items-center gap-3 p-3 rounded-lg w-full group`}
                      onClick={() => setOpenMobile(false)}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && (
                        <div className="flex-1 text-left">
                          <span className="font-medium block">{item.title}</span>
                          <span className="text-xs opacity-80 block">
                            {item.description}
                          </span>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Health Tip Section */}
        {!collapsed && (
          <div className="mt-8 p-4 bg-gradient-medical rounded-lg shadow-soft">
            <h3 className="text-sm font-semibold text-accent-foreground mb-2">
              💡 Health Tip of the Day
            </h3>
            <p className="text-xs text-accent-foreground opacity-90">
              {getDailyTip()}
            </p>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}