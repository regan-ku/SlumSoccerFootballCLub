
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type Theme = "dark" | "light";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "light",
  setTheme: () => null,
};

const ThemeProviderContext =
  createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "slum-stars-theme",
}: ThemeProviderProps) {
  /*
   * Important:
   * The actual theme class is applied by the inline script
   * in RootLayout BEFORE the page paints.
   *
   * This state is only used by React after hydration.
   */
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") {
      return defaultTheme;
    }

    const savedTheme = localStorage.getItem(storageKey);

    if (savedTheme === "dark" || savedTheme === "light") {
      return savedTheme;
    }

    return defaultTheme;
  });

  /*
   * Keep the <html> class synchronized with React state.
   *
   * The initial class has already been applied before paint,
   * so this does not cause the initial light/dark flash.
   */
  useEffect(() => {
    const root = document.documentElement;

    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme);

    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(newTheme);

    setThemeState(newTheme);
  };

  return (
    <ThemeProviderContext.Provider
      value={{
        theme,
        setTheme,
      }}
    >
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  return context;
};
