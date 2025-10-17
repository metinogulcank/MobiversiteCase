"use client";
import { useEffect, useState } from "react";

const slides = [
  "/banner/banner1.png",
  "/banner/banner2.png",
  "/banner/banner1.png",
];

export default function HeroSlider({ className = "h-[40vh] md:h-[45vh] lg:h-[50vh] xl:h-[55vh] 2xl:h-[60vh]" }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 4000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className={`w-full overflow-hidden relative rounded bg-white ${className}`}>
      {slides.map((src, i) => (
        <img
          key={i}
          src={src}
          alt="slide"
          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"}`}
        />
      ))}
    </div>
  );
}


