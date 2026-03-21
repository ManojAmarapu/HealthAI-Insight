import { NavLink } from "react-router-dom";
import { MessageCircle, Search, Stethoscope, TrendingUp, Calculator } from "lucide-react";

const NAV_ITEMS = [
  { title: "Chat",      url: "/",          icon: MessageCircle },
  { title: "Predict",   url: "/predict",   icon: Search        },
  { title: "Treatment", url: "/treatment", icon: Stethoscope   },
  { title: "Insights",  url: "/insights",  icon: TrendingUp    },
  { title: "BMI",       url: "/bmi",       icon: Calculator    },
];

export function MobileBottomNav() {
  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 flex items-stretch"
      style={{
        // --muted gives a subtly different tone vs page background in both light and dark mode
        background: "hsl(var(--muted))",
        borderTop: "1px solid hsl(var(--border) / 0.8)",
        boxShadow: "0 -2px 12px rgba(0,0,0,0.07)",
      }}
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.url}
            to={item.url}
            end={item.url === "/"}
            className="relative flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-all duration-200 group"
          >
            {({ isActive }) => (
              <>
                {/* Subtle top indicator using app's primary color */}
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-b-full bg-primary opacity-70" />
                )}

                {/* Icon — primary tint when active, muted when not */}
                <span
                  className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-primary/10 scale-105"
                      : "scale-100"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  />
                </span>

                {/* Label */}
                <span
                  className={`text-[10px] font-medium transition-colors ${
                    isActive
                      ? "text-primary font-semibold"
                      : "text-muted-foreground group-hover:text-foreground"
                  }`}
                >
                  {item.title}
                </span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
