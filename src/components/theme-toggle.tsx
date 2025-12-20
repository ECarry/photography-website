"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

// Hydration-safe hook to detect if component is mounted on client
const emptySubscribe = () => () => {};
const useIsMounted = () =>
  useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

// Utility function to handle view transitions
const addViewTransition = (callback: () => void) => {
  if (!document.startViewTransition) {
    callback();
    return;
  }

  document.startViewTransition(callback);
};

// Dashboard page Theme Toggle
export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() =>
        addViewTransition(() => setTheme(theme === "light" ? "dark" : "light"))
      }
    >
      <Sun className="h-6 w-[1.3rem] dark:hidden" color="#000" />
      <Moon className="hidden h-5 w-5 dark:block" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

// Home page Theme Switch
export function ThemeSwitch() {
  const mounted = useIsMounted();
  const { setTheme, resolvedTheme: theme } = useTheme();

  const switchTheme = () => {
    addViewTransition(() => {
      setTheme(theme === "light" ? "dark" : "light");
    });
  };

  // Return a non-interactive switch component as a placeholder
  if (!mounted) {
    return <Switch checked={false} disabled aria-label="Toggle theme" />;
  }

  return (
    <Switch
      checked={theme === "dark"}
      onCheckedChange={() => switchTheme()}
      aria-label="Toggle theme"
    />
  );
}
