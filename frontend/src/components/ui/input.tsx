import * as React from "react";
import { cn } from "@/utils/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || React.useId();

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold uppercase tracking-wider text-charcoal-700 select-none"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full min-w-0">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-charcoal-500">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              "w-full min-w-0 h-11 px-3.5 rounded-xl border bg-white text-sm text-charcoal-900 placeholder:text-charcoal-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 disabled:opacity-50 disabled:bg-charcoal-50 disabled:cursor-not-allowed shadow-subtle",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error
                ? "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                : "border-surface-border",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 flex items-center pointer-events-none text-charcoal-500">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-red-600 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-charcoal-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
