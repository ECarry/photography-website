"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("size-9", className)}
      onClick={() =>
        addViewTransition(() => setTheme(theme === "light" ? "dark" : "light"))
      }
    >
      <Sun className="size-4 dark:hidden" />
      <Moon className="hidden size-4 dark:block" />
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
