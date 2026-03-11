import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

// BUG-06 & BUG-16: Safe localStorage helper with try/catch for private browsing
function getStoredTheme(): "light" | "dark" | null {
    try {
        return localStorage.getItem("healthai-theme") as "light" | "dark" | null;
    } catch {
        return null;
    }
}

function setStoredTheme(theme: "light" | "dark") {
    try {
        localStorage.setItem("healthai-theme", theme);
    } catch {
        // localStorage unavailable (e.g., private browsing in some browsers) — fail silently
    }
}

// BUG-06: Compute the initial theme synchronously BEFORE first render
// This eliminates the light→dark flash for dark-mode users
function getInitialTheme(): "light" | "dark" {
    const saved = getStoredTheme();
    if (saved) return saved;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
    }
    return "light";
}

export function ThemeToggle() {
    // BUG-06: Initialize directly from storage/system — no "light" hard-code default
    const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme);

    // Apply the class on mount so it matches the initial state immediately
    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        // BUG-16: Safe localStorage write
        setStoredTheme(newTheme);
        document.documentElement.classList.toggle("dark", newTheme === "dark");
    };

    return (
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
            {/* BUG-17: Icon now correctly reflects actual current theme (no flash) */}
            {theme === "light" ? (
                <Sun className="h-[1.2rem] w-[1.2rem] text-foreground transition-all" />
            ) : (
                <Moon className="h-[1.2rem] w-[1.2rem] text-foreground transition-all" />
            )}
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
