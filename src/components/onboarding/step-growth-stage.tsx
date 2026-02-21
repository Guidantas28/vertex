"use client";

import { motion } from "framer-motion";
import { useOnboardingStore } from "@/stores/onboarding.store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GrowthStage } from "@/types/database";

const STAGES: {
  stage: GrowthStage;
  label: string;
  emoji: string;
  description: string;
  detail: string;
}[] = [
  {
    stage: "starting",
    label: "Começando",
    emoji: "🌱",
    description: "Menos de 6 meses de operação",
    detail: "Estou validando o negócio e buscando os primeiros clientes",
  },
  {
    stage: "growing",
    label: "Crescendo",
    emoji: "📈",
    description: "6 meses a 2 anos",
    detail: "Já tenho clientes regulares, mas quero crescer mais rápido",
  },
  {
    stage: "scaling",
    label: "Escalando",
    emoji: "🚀",
    description: "2 a 5 anos",
    detail: "Tenho um processo funcionando e quero multiplicar os resultados",
  },
  {
    stage: "established",
    label: "Consolidado",
    emoji: "🏆",
    description: "Mais de 5 anos",
    detail: "Negócio sólido, buscando otimização e novos mercados",
  },
];

export function StepGrowthStage() {
  const { data, updateData, nextStep, prevStep } = useOnboardingStore();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold tracking-tight text-foreground"
        >
          Em qual fase está o seu negócio?
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground"
        >
          Cada fase tem desafios e estratégias diferentes.
        </motion.p>
      </div>

      <div className="space-y-3">
        {STAGES.map(({ stage, label, emoji, description, detail }, index) => (
          <motion.button
            key={stage}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
            onClick={() => updateData({ growthStage: stage })}
            className={cn(
              "w-full flex items-start gap-4 rounded-xl border p-4 text-left transition-all duration-200",
              "hover:border-primary/50 hover:bg-primary/5",
              data.growthStage === stage
                ? "border-primary bg-primary/10 shadow-glow-sm"
                : "border-border bg-card"
            )}
          >
            <span className="text-3xl mt-0.5">{emoji}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p
                  className={cn(
                    "font-semibold",
                    data.growthStage === stage
                      ? "text-primary"
                      : "text-foreground"
                  )}
                >
                  {label}
                </p>
                <span className="text-xs text-muted-foreground">
                  · {description}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{detail}</p>
            </div>
            <div
              className={cn(
                "mt-1 h-5 w-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center shrink-0",
                data.growthStage === stage
                  ? "border-primary bg-primary"
                  : "border-border"
              )}
            >
              {data.growthStage === stage && (
                <svg
                  className="h-3 w-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex gap-3"
      >
        <Button variant="outline" size="lg" onClick={prevStep} className="w-24">
          Voltar
        </Button>
        <Button
          size="lg"
          variant="gradient"
          className="flex-1"
          disabled={!data.growthStage}
          onClick={nextStep}
        >
          Continuar
        </Button>
      </motion.div>
    </div>
  );
}
