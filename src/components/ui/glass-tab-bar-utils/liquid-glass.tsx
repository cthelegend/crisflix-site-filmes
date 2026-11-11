import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

// CSS glass works without SVG filters and keeps the site's existing theme tokens.
export function LiquidGlass({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("liquid-glass", className)} {...props} />;
}
