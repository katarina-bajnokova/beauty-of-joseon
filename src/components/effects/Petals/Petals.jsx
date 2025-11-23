import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const PETAL_IMAGES = [
  "/petals/petal1.png",
  "/petals/petal2.png",
  "/petals/petal3.png",
];

const Petals = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;

    const createPetal = (x, y) => {
      const petal = document.createElement("div");
      petal.classList.add("falling-petal");

      const img = PETAL_IMAGES[Math.floor(Math.random() * PETAL_IMAGES.length)];
      petal.style.backgroundImage = `url(${img})`;

      const size = gsap.utils.random(16, 42);
      petal.style.width = `${size}px`;
      petal.style.height = `${size}px`;

      petal.style.opacity = gsap.utils.random(0.25, 0.55);

      const offsetX = gsap.utils.random(-12, 12);
      const offsetY = gsap.utils.random(-12, 12);
      petal.style.left = `${x + offsetX}px`;
      petal.style.top = `${y + offsetY}px`;

      container.appendChild(petal);

      gsap.to(petal, {
        y: "+=" + gsap.utils.random(250, 400),
        x: "+=" + gsap.utils.random(-60, 60),
        rotationZ: gsap.utils.random(-80, 80),
        rotationY: gsap.utils.random(-180, 180),
        rotationX: gsap.utils.random(-90, 90),
        scale: gsap.utils.random(0.8, 1.2),
        opacity: 0,
        duration: gsap.utils.random(4, 7),
        ease: "power1.out",
        onComplete: () => petal.remove(),
      });
    };

    const handleMove = (e) => {
      if (Math.random() < 0.04) createPetal(e.clientX, e.clientY);
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return <div ref={containerRef} className="petal-container" />;
};

export default Petals;
