"use client";

import { motion } from "framer-motion";
import { useOnboardingStore } from "@/stores/onboarding.store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GrowthGoal } from "@/types/database";

const GOALS: {
  goal: GrowthGoal;
  label: string;
  emoji: string;
  description: string;
}[] = [
  {
    goal: "more_leads",
    label: "Atrair mais clientes",
    emoji: "🎯",
    description: "Quero mais pessoas me procurando",
  },
  {
    goal: "more_sales",
    label: "Fechar mais vendas",
    emoji: "💰",
    description: "Quero converter contatos em pagamentos",
  },
  {
    goal: "better_retention",
    label: "Reter clientes atuais",
    emoji: "🔄",
    description: "Quero que voltem e indiquem",
  },
  {
    goal: "automate_processes",
    label: "Automatizar processos",
    emoji: "⚡",
    description: "Quero parar de fazer tudo manual",
  },
  {
    goal: "understand_data",
    label: "Entender os números",
    emoji: "📊",
    description: "Quero saber o que está funcionando",
  },
];

export function StepGoals() {
  const { data, updateData, nextStep, prevStep } = useOnboardingStore();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold tracking-tight text-foreground"
        >
          Qual é o seu principal objetivo agora?
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground"
        >
          Vamos priorizar o que mais importa para você nesse momento.
        </motion.p>
      </div>

      <div className="space-y-3">
        {GOALS.map(({ goal, label, emoji, description }, index) => (
          <motion.button
            key={goal}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.07 }}
            onClick={() => updateData({ primaryGoal: goal })}
            className={cn(
              "w-full flex items-center gap-4 rounded-xl border p-4 text-left transition-all duration-200",
              "hover:border-primary/50 hover:bg-primary/5",
              data.primaryGoal === goal
                ? "border-primary bg-primary/10 shadow-glow-sm"
                : "border-border bg-card"
            )}
          >
            <span className="text-3xl">{emoji}</span>
            <div className="flex-1">
              <p
                className={cn(
                  "font-semibold",
                  data.primaryGoal === goal
                    ? "text-primary"
                    : "text-foreground"
                )}
              >
                {label}
              </p>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <div
              className={cn(
                "h-5 w-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center",
                data.primaryGoal === goal
                  ? "border-primary bg-primary"
                  : "border-border"
              )}
            >
              {data.primaryGoal === goal && (
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
          disabled={!data.primaryGoal}
          onClick={nextStep}
        >
          Continuar
        </Button>
      </motion.div>
    </div>
  );
}
