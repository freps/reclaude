import { useEffect, useState } from "react";

export function useWindowScroll() {
  const [scroll, setScroll] = useState({ x: window.scrollX, y: window.scrollY });
  useEffect(() => {
    const handler = () => setScroll({ x: window.scrollX, y: window.scrollY });
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
  return scroll;
}
