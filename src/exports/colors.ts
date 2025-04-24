import { useState, useEffect } from "react";

export const useColorScheme = () => {
  const [colorScheme, setColorScheme] = useState<Record<string, string>>({});

  const updateColors = () => {
    const docStyle = window.getComputedStyle(window.document.body);
    const scheme = {
      D: docStyle.getPropertyValue("--dem"),
      R: docStyle.getPropertyValue("--rep"),
      I: docStyle.getPropertyValue("--ind"),
      Yea: docStyle.getPropertyValue("--color-yea"),
      Nay: docStyle.getPropertyValue("--color-nay"),
      "Not Voting": docStyle.getPropertyValue("--color-dnv"),
      gridX: docStyle.getPropertyValue("--grid-x"),
      gridY: docStyle.getPropertyValue("--grid-y"),
      legendColor: docStyle.getPropertyValue("--color-foreground"),
    }
    setColorScheme(scheme);
  };

  useEffect(() => {
    updateColors();

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => updateColors();

    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  return colorScheme;
}