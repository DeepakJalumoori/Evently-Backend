import { cn } from "@/utils/cn";
import { Loader2 } from "lucide-react";

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

export function LoadingSpinner({
  size = "md",
  className,
  label,
}: LoadingSpinnerProps) {
  const sizeStyles = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div
      role="status"
      className={cn("flex flex-col items-center justify-center gap-2", className)}
    >
      <Loader2
        className={cn("animate-spin text-coral-500", sizeStyles[size])}
      />
      {label && (
        <span className="text-xs font-medium text-charcoal-500">{label}</span>
      )}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
