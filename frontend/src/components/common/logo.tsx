import * as React from "react";
import { cn } from "@/utils/cn";

export interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "full" | "icon";
  size?: "sm" | "md" | "lg";
}

export function Logo({
  variant = "full",
  size = "md",
  className,
  ...props
}: LogoProps) {
  const sizeMap = {
    sm: { icon: "h-6 w-6 rounded-lg", text: "text-base tracking-tight" },
    md: { icon: "h-8 w-8 rounded-xl", text: "text-xl tracking-tight" },
    lg: { icon: "h-10 w-10 rounded-2xl", text: "text-2xl tracking-tight" },
  };

  return (
    <div
      className={cn("inline-flex items-center gap-2.5 select-none", className)}
      {...props}
    >
      {/* Original Evently Geometric Vector Mark: Clean ticket aperture with bright coral focal dot */}
      <div
        className={cn(
          "relative flex items-center justify-center bg-coral-500 shadow-sm transition-transform hover:scale-105",
          sizeMap[size].icon
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-4/5 w-4/5"
        >
          <path
            d="M6 8C6 6.89543 6.89543 6 8 6H16C17.1046 6 18 6.89543 18 8V10H6V8Z"
            fill="white"
            fillOpacity="0.95"
          />
          <path
            d="M6 12H18V16C18 17.1046 17.1046 18 16 18H8C6.89543 18 6 17.1046 6 16V12Z"
            fill="white"
            fillOpacity="0.35"
          />
          <circle cx="14.5" cy="14.5" r="1.75" fill="white" />
        </svg>
      </div>

      {variant === "full" && (
        <span
          className={cn(
            "font-bold font-sans text-charcoal-900 leading-none",
            sizeMap[size].text
          )}
        >
          Evently<span className="text-coral-500 font-extrabold">.</span>
        </span>
      )}
    </div>
  );
}
