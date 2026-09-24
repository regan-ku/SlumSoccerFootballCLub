
"use client";

import { useTheme } from "@/components/providers/ThemeProviders";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  /*
   * Keep the button from rendering the wrong icon
   * before hydration.
   */
  if (!mounted) {
    return (
      <button
        type="button"
        className="p-2 bg-muted/50 border border-border rounded-sm text-muted-foreground"
        aria-label="Toggle theme"
        disabled
      >
        <div className="w-4 h-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="p-2 bg-muted/50 border border-border rounded-sm text-muted-foreground hover:border-accent hover:text-foreground transition-colors"
      aria-label={
        theme === "dark"
          ? "Switch to light mode"
          : "Switch to dark mode"
      }
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  );
}
