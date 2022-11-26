import { useEffect, useState } from "react";

import type { ColorScheme } from "types";

export const useColorScheme = (): ColorScheme => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>("dark");

  useEffect(() => {
    const darkMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    setColorScheme(darkMediaQuery.matches ? "dark" : "light");

    const handleChange = (event: MediaQueryListEvent) => {
      setColorScheme(event.matches ? "dark" : "light");
    };

    darkMediaQuery.addEventListener("change", handleChange);

    return () => {
      darkMediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return colorScheme;
};
