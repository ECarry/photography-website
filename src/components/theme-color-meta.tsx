"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

const THEME_COLORS: Record<string, string> = {
  light: "#ffffff",
  dark: "#0a0a0a",
};

export function ThemeColorMeta() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const color =
      resolvedTheme === "dark" ? THEME_COLORS.dark : THEME_COLORS.light;

    const existing = document.querySelectorAll('meta[name="theme-color"]');
    existing.forEach((el) => el.remove());

    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.content = color;
    document.head.appendChild(meta);
  }, [resolvedTheme]);

  return null;
}
