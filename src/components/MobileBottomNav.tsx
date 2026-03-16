import { NavLink } from "react-router-dom";
import { MessageCircle, Search, Stethoscope, TrendingUp, Calculator } from "lucide-react";

const NAV_ITEMS = [
  { title: "Chat",      url: "/",          icon: MessageCircle, gradient: "from-blue-500 to-cyan-400"   },
  { title: "Predict",   url: "/predict",   icon: Search,        gradient: "from-emerald-500 to-green-400" },
  { title: "Treatment", url: "/treatment", icon: Stethoscope,   gradient: "from-purple-500 to-violet-400" },
  { title: "Insights",  url: "/insights",  icon: TrendingUp,    gradient: "from-orange-500 to-amber-400"  },
  { title: "BMI",       url: "/bmi",       icon: Calculator,    gradient: "from-rose-500 to-pink-400"    },
];

export function MobileBottomNav() {
  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 flex items-stretch"
      style={{
        background: "rgba(var(--card) / 0.85)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderTop: "1px solid rgba(var(--border) / 0.6)",
        boxShadow: "0 -8px 32px rgba(0,0,0,0.12)",
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
                {/* Active pill background */}
                {isActive && (
                  <span className={`absolute inset-x-2 inset-y-1.5 rounded-xl bg-gradient-to-b ${item.gradient} opacity-10 pointer-events-none`} />
                )}

                {/* Top indicator line */}
                {isActive && (
                  <span className={`absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-b-full bg-gradient-to-r ${item.gradient}`} />
                )}

                {/* Icon */}
                <span
                  className={`relative flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200 ${
                    isActive ? `bg-gradient-to-br ${item.gradient} shadow-sm scale-110` : "scale-100"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  />
                </span>

                {/* Label */}
                <span
                  className={`text-[10px] font-semibold transition-colors ${
                    isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
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
