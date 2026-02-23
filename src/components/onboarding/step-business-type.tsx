"use client";

import { motion } from "framer-motion";
import { useOnboardingStore } from "@/stores/onboarding.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { BusinessType } from "@/types/database";

const BUSINESS_TYPES: { type: BusinessType; label: string; emoji: string; description: string }[] = [
  { type: "clinic", label: "Clínica / Saúde", emoji: "🏥", description: "Médicos, dentistas, psicólogos" },
  { type: "service_provider", label: "Prestador de Serviços", emoji: "🔧", description: "Elétrica, reforma, estética" },
  { type: "local_business", label: "Negócio Local", emoji: "🏪", description: "Restaurante, loja física" },
  { type: "freelancer", label: "Freelancer / Autônomo", emoji: "💻", description: "Designer, dev, consultor" },
  { type: "agency", label: "Agência", emoji: "📱", description: "Marketing, criação de conteúdo" },
  { type: "ecommerce", label: "E-commerce", emoji: "📦", description: "Loja online, dropshipping" },
  { type: "other", label: "Outro", emoji: "✨", description: "Qualquer outro tipo de negócio" },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export function StepBusinessType() {
  const { data, updateData, nextStep } = useOnboardingStore();

  const handleSelect = (type: BusinessType) => {
    updateData({ businessType: type });
  };

  const canContinue = data.businessType !== null && data.businessName.trim().length > 0;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
        >
          👋 Bem-vindo ao Vertex
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold tracking-tight text-foreground"
        >
          Qual é o seu tipo de negócio?
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-muted-foreground"
        >
          Vamos personalizar tudo para o seu contexto específico.
        </motion.p>
      </div>

      {/* Business name */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Input
          label="Nome do seu negócio"
          placeholder="Ex: Clínica Vida Plena, Studio Silva..."
          value={data.businessName}
          onChange={(e) => updateData({ businessName: e.target.value })}
        />
      </motion.div>

      {/* Business type grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 sm:grid-cols-3 gap-3"
      >
        {BUSINESS_TYPES.map(({ type, label, emoji, description }) => (
          <motion.button
            key={type}
            variants={item}
            onClick={() => handleSelect(type)}
            className={cn(
              "relative flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all duration-200",
              "hover:border-primary/50 hover:bg-primary/5 hover:shadow-card-hover",
              data.businessType === type
                ? "border-primary bg-primary/10 shadow-glow-sm"
                : "border-border bg-card"
            )}
          >
            {data.businessType === type && (
              <motion.div
                layoutId="selected-check"
                className="absolute right-2 top-2 h-4 w-4 rounded-full gradient-brand flex items-center justify-center"
                initial={false}
              >
                <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </motion.div>
            )}
            <span className="text-2xl">{emoji}</span>
            <div>
              <p className={cn(
                "text-sm font-semibold",
                data.businessType === type ? "text-primary" : "text-foreground"
              )}>{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>
          </motion.button>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Button
          size="lg"
          className="w-full"
          variant="gradient"
          disabled={!canContinue}
          onClick={nextStep}
        >
          Continuar
        </Button>
      </motion.div>
    </div>
  );
}
