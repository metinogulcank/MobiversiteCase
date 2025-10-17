"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "300₺ ve üzeri alışverişlerde kargo bedava",
  "Yeni sezon ürünlerinde kaçırılmayacak fırsatlar!",
];

export default function CampaignBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % MESSAGES.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="campaign-bar w-full text-xs">
      <div className="campaign-slide-viewport">
        <div
          className="campaign-slide-inner"
          style={{ transform: `translateY(-${index * 32}px)` }}
        >
          {MESSAGES.concat(MESSAGES[0]).map((msg, i) => (
            <div key={i} className="campaign-row">{msg}</div>
          ))}
        </div>
      </div>
    </div>
  );
}


