"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface BlurTextProps {
  text: string;
  delay?: number; // delay between elements in ms
  animateBy?: "words" | "characters";
  direction?: "top" | "bottom";
  className?: string;
  once?: boolean;
}

export default function BlurText({
  text,
  delay = 50,
  animateBy = "words",
  direction = "bottom",
  className = "",
  once = true,
}: BlurTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once });

  const elements = animateBy === "words" ? text.split(" ") : text.split("");

  const yOffset = direction === "top" ? -12 : 12;

  return (
    <span ref={ref} className={`inline-flex flex-wrap gap-x-[0.25em] ${className}`}>
      {elements.map((item, i) => (
        <motion.span
          key={`${item}-${i}`}
          initial={{ filter: "blur(10px)", opacity: 0, y: yOffset }}
          animate={isInView ? { filter: "blur(0px)", opacity: 1, y: 0 } : { filter: "blur(10px)", opacity: 0, y: yOffset }}
          transition={{
            duration: 0.45,
            delay: (i * delay) / 1000,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="inline-block"
        >
          {item}
        </motion.span>
      ))}
    </span>
  );
}
