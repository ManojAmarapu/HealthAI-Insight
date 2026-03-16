import { useLocation } from "react-router-dom";
import { MessageCircle, Search, Stethoscope, TrendingUp, Calculator } from "lucide-react";

const NAV_ITEMS = [
  { title: "Chat", url: "/", icon: MessageCircle },
  { title: "Predict", url: "/predict", icon: Search },
  { title: "Treatment", url: "/treatment", icon: Stethoscope },
  { title: "Insights", url: "/insights", icon: TrendingUp },
  { title: "BMI", url: "/bmi", icon: Calculator },
];

export function MobileBottomNav() {
  const location = useLocation();
  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border flex items-stretch">
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.url;
        const Icon = item.icon;
        return (
          <a
            key={item.url}
            href={item.url}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
              isActive
                ? "text-primary bg-primary/5"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.title}</span>
            {isActive && <div className="absolute top-0 w-8 h-0.5 bg-primary rounded-b-full" />}
          </a>
        );
      })}
    </nav>
  );
}
