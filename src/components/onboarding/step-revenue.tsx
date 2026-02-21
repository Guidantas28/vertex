"use client";

import { motion } from "framer-motion";
import { useOnboardingStore } from "@/stores/onboarding.store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const REVENUE_RANGES = [
  { value: "0-3k", label: "Até R$ 3.000", description: "Começando agora" },
  { value: "3k-10k", label: "R$ 3.000 – R$ 10.000", description: "Primeiros clientes" },
  { value: "10k-30k", label: "R$ 10.000 – R$ 30.000", description: "Crescendo consistentemente" },
  { value: "30k-100k", label: "R$ 30.000 – R$ 100.000", description: "Negócio estabelecido" },
  { value: "100k+", label: "Mais de R$ 100.000", description: "Escala e expansão" },
  { value: "prefer_not_to_say", label: "Prefiro não informar", description: "" },
];

export function StepRevenue() {
  const { data, updateData, nextStep, prevStep } = useOnboardingStore();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold tracking-tight text-foreground"
        >
          Qual é o seu faturamento mensal atual?
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground"
        >
          Isso nos ajuda a definir metas realistas e relevantes para você.
          <span className="block text-xs mt-1">
            🔒 Esta informação é privada e segura.
          </span>
        </motion.p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {REVENUE_RANGES.map(({ value, label, description }, index) => (
          <motion.button
            key={value}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            onClick={() => updateData({ monthlyRevenueRange: value })}
            className={cn(
              "flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-all duration-200",
              "hover:border-primary/50 hover:bg-primary/5",
              data.monthlyRevenueRange === value
                ? "border-primary bg-primary/10 shadow-glow-sm"
                : "border-border bg-card"
            )}
          >
            <p
              className={cn(
                "font-semibold text-sm",
                data.monthlyRevenueRange === value
                  ? "text-primary"
                  : "text-foreground"
              )}
            >
              {label}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
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
          disabled={!data.monthlyRevenueRange}
          onClick={nextStep}
        >
          Continuar
        </Button>
      </motion.div>
    </div>
  );
}
