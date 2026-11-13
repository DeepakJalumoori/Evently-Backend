import * as React from "react";
import { cn } from "@/utils/cn";
import { Sparkles } from "lucide-react";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-surface-border bg-white/50",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-coral-50 text-coral-500 mb-4 shadow-subtle border border-coral-100">
        {icon || <Sparkles className="h-6 w-6" />}
      </div>
      <h4 className="text-base font-semibold text-charcoal-900">{title}</h4>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-charcoal-500">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
