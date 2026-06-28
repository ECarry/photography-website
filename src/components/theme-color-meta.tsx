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

    let meta = document.head.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"][data-managed="theme-color-meta"]'
    );

    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.setAttribute("data-managed", "theme-color-meta");
      document.head.appendChild(meta);
    }

    meta.content = color;
  }, [resolvedTheme]);

  return null;
}
