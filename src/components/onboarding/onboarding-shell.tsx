"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useOnboardingStore } from "@/stores/onboarding.store";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const TOTAL_STEPS = 5;

const STEP_LABELS = [
  "Seu negócio",
  "Seu objetivo",
  "Faturamento",
  "Fase de crescimento",
  "Canais que usa",
];

interface OnboardingShellProps {
  children: React.ReactNode;
}

export function OnboardingShell({ children }: OnboardingShellProps) {
  const { currentStep } = useOnboardingStore();
  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg gradient-brand flex items-center justify-center">
            <span className="text-white font-bold text-xs">V</span>
          </div>
          <span className="font-semibold text-foreground">Vertex</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {currentStep + 1} de {TOTAL_STEPS}
          </span>
          <div className="w-32">
            <Progress value={progress} />
          </div>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-center gap-2 py-4 px-6">
        {STEP_LABELS.map((label, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className={cn(
                "flex items-center justify-center rounded-full text-xs font-semibold transition-all duration-300",
                index < currentStep
                  ? "h-6 w-6 gradient-brand text-white"
                  : index === currentStep
                    ? "h-6 w-6 bg-primary text-primary-foreground shadow-glow-sm"
                    : "h-6 w-6 bg-muted text-muted-foreground"
              )}
            >
              {index < currentStep ? (
                <svg
                  className="h-3 w-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                index + 1
              )}
            </div>
            <span
              className={cn(
                "text-xs hidden sm:block transition-colors duration-300",
                index === currentStep
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              {label}
            </span>
            {index < TOTAL_STEPS - 1 && (
              <div
                className={cn(
                  "hidden sm:block h-px w-6 transition-colors duration-500",
                  index < currentStep ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
