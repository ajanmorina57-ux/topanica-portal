"use client";

import type { ReactNode } from "react";
import { Children } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

const easing = [0.22, 1, 0.36, 1] as const;

export function HeroSequence({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : "hidden"}
      animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12, delayChildren: 0.08 } } }}
    >
      {Children.map(children, (child) => (
        <motion.div
          className="motion-sequence-item"
          variants={{ hidden: { opacity: 0, y: reduce ? 0 : 16 }, visible: { opacity: 1, y: 0 } }}
          transition={{ duration: reduce ? 0.01 : 0.68, ease: easing }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "li";
}) {
  const reduce = useReducedMotion();
  const Component = as === "li" ? motion.li : motion.div;
  return (
    <Component
      className={className}
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: reduce ? 0.01 : 0.62, delay: reduce ? 0 : delay, ease: easing }}
    >
      {children}
    </Component>
  );
}

export function ReadingProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const springProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  return <motion.div aria-hidden="true" className="reading-progress" style={{ scaleX: reduce ? scrollYProgress : springProgress }} />;
}
