import type { ReactNode } from "react";
import { Children } from "react";

export function HeroSequence({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      {Children.map(children, (child) => (
        <div className="motion-sequence-item">{child}</div>
      ))}
    </div>
  );
}

/** Renders content visible immediately so fast scrolling never leaves elements hidden. */
export function Reveal({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "li";
}) {
  if (as === "li") {
    return <li className={className}>{children}</li>;
  }
  return <div className={className}>{children}</div>;
}
