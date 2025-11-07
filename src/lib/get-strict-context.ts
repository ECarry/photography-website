"use client";

import type React from "react";

import { createContext, useContext } from "react";

/**
 * Creates a context with a strict getter hook that ensures the context is used within a provider.
 * Returns a tuple of [Provider, useHook] similar to React's useState pattern.
 */
export function getStrictContext<T>(
  displayName: string
): [React.Provider<T>, () => T] {
  const Context = createContext<T | undefined>(undefined);
  Context.displayName = displayName;

  const useStrictContext = (): T => {
    const value = useContext(Context);

    if (value === undefined) {
      throw new Error(
        `${displayName} must be used within a ${displayName}Provider`
      );
    }

    return value;
  };

  return [Context.Provider, useStrictContext];
}
