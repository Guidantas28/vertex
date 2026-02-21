import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, label, error, hint, leftIcon, rightIcon, id, ...props },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, "-");

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            className={cn(
              "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background",
              "placeholder:text-muted-foreground/60",
              "transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:border-primary",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-destructive focus-visible:ring-destructive",
              leftIcon && "pl-9",
              rightIcon && "pr-9",
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        {hint && !error && (
          <p className="text-xs text-muted-foreground">{hint}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
