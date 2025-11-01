"use client";
import { useEffect, useState } from "react";

export default function useIsMobile(maxWidth = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${maxWidth}px)`);

    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(event.matches);
    };

    // evaluate immediately so the first render matches current viewport
    handleChange(mediaQuery);

    const listener = (event: MediaQueryListEvent) => handleChange(event);
    mediaQuery.addEventListener("change", listener);

    return () => mediaQuery.removeEventListener("change", listener);
  }, [maxWidth]);

  return isMobile;
}
