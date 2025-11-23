import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function initGSAP() {
  gsap.registerPlugin(ScrollTrigger);
}
