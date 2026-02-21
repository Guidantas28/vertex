"use client";

import { motion } from "framer-motion";
import { useOnboardingStore } from "@/stores/onboarding.store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CHANNELS = [
  { id: "whatsapp", label: "WhatsApp", emoji: "💬", description: "Atendimento e vendas" },
  { id: "instagram", label: "Instagram", emoji: "📸", description: "Divulgação e contato" },
  { id: "facebook", label: "Facebook", emoji: "👥", description: "Grupos e página" },
  { id: "google", label: "Google Meu Negócio", emoji: "🔍", description: "Buscas locais" },
  { id: "email", label: "E-mail", emoji: "📧", description: "Comunicação formal" },
  { id: "phone", label: "Telefone", emoji: "📞", description: "Ligações diretas" },
  { id: "in_person", label: "Presencial", emoji: "🤝", description: "Atendimento físico" },
  { id: "referral", label: "Indicações", emoji: "⭐", description: "Boca a boca" },
];

interface StepChannelsProps {
  onComplete: () => void;
  isSubmitting?: boolean;
}

export function StepChannels({ onComplete, isSubmitting = false }: StepChannelsProps) {
  const { data, updateData, prevStep } = useOnboardingStore();

  const toggleChannel = (channelId: string) => {
    const current = data.channelsUsed;
    if (current.includes(channelId)) {
      updateData({ channelsUsed: current.filter((c) => c !== channelId) });
    } else {
      updateData({ channelsUsed: [...current, channelId] });
    }
  };

  const canContinue = data.channelsUsed.length > 0;

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold tracking-tight text-foreground"
        >
          Quais canais você usa hoje?
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground"
        >
          Selecione todos os que você usa para se comunicar com clientes.
        </motion.p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {CHANNELS.map(({ id, label, emoji, description }, index) => {
          const isSelected = data.channelsUsed.includes(id);
          return (
            <motion.button
              key={id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => toggleChannel(id)}
              type="button"
              className={cn(
                "flex items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200",
                "hover:border-primary/50 hover:bg-primary/5",
                isSelected
                  ? "border-primary bg-primary/10 shadow-glow-sm"
                  : "border-border bg-card"
              )}
            >
              <span className="text-2xl">{emoji}</span>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-semibold truncate",
                    isSelected ? "text-primary" : "text-foreground"
                  )}
                >
                  {label}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {description}
                </p>
              </div>
              <div
                className={cn(
                  "h-4 w-4 rounded shrink-0 border-2 transition-all duration-200 flex items-center justify-center",
                  isSelected ? "border-primary bg-primary" : "border-border"
                )}
              >
                {isSelected && (
                  <svg
                    className="h-2.5 w-2.5 text-white"
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
          );
        })}
      </div>

      {/* Summary teaser */}
      {canContinue && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-primary/20 bg-primary/5 p-4"
        >
          <p className="text-sm font-medium text-primary">
            ✨ Perfeito! Com base nas suas respostas, vamos configurar seu painel personalizado.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {data.channelsUsed.length} canal{data.channelsUsed.length !== 1 ? "is" : ""} selecionado{data.channelsUsed.length !== 1 ? "s" : ""}
          </p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex gap-3"
      >
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={prevStep}
          className="w-24"
          disabled={isSubmitting}
        >
          Voltar
        </Button>
        <Button
          type="button"
          size="lg"
          variant="gradient"
          className="flex-1"
          disabled={!canContinue || isSubmitting}
          loading={isSubmitting}
          onClick={onComplete}
        >
          {isSubmitting ? "Criando seu painel..." : "Criar meu painel 🚀"}
        </Button>
      </motion.div>
    </div>
  );
}
