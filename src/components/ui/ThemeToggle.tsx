"use client";

import { useTheme } from "@/components/providers/ThemeProviders"; // <-- Ensure this matches your actual file name (singular)
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Wait for client-side mount to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Render a placeholder of the exact same size during SSR/initial hydration
  // This prevents React from seeing a mismatch between server and client
  if (!mounted) {
    return (
      <button
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
      onClick={toggleTheme}
      className="p-2 bg-muted/50 border border-border rounded-sm text-muted-foreground hover:border-accent hover:text-foreground transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  );
}