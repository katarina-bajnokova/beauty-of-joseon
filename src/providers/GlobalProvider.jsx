import { useEffect } from "react";
import { initLenis } from "@/lib/scroll/lenis";
import { initGSAP } from "@/lib/animations/gsapConfig";

export default function GlobalProvider({ children }) {
  useEffect(() => {
    initLenis();
    initGSAP();
  }, []);

  return children;
}
