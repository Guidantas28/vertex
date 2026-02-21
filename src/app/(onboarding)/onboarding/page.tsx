"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/stores/onboarding.store";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { StepBusinessType } from "@/components/onboarding/step-business-type";
import { StepGoals } from "@/components/onboarding/step-goals";
import { StepRevenue } from "@/components/onboarding/step-revenue";
import { StepGrowthStage } from "@/components/onboarding/step-growth-stage";
import { StepChannels } from "@/components/onboarding/step-channels";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function OnboardingPage() {
  const router = useRouter();
  const { currentStep, data, reset } = useOnboardingStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.error("Sessão expirada. Faça login novamente.");
        router.push("/login");
        return;
      }

      const slug = (data.businessName || "meu-negocio")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .slice(0, 50);

      const { data: result, error: rpcError } = await supabase.rpc(
        "create_organization_for_user",
        {
          p_name: data.businessName || "Meu Negócio",
          p_slug: `${slug}-${Date.now()}`,
          p_business_type: data.businessType,
          p_primary_goal: data.primaryGoal,
          p_growth_stage: data.growthStage,
          p_monthly_revenue_range: data.monthlyRevenueRange,
          p_channels_used: data.channelsUsed,
        }
      );

      if (rpcError) {
        console.error("Onboarding RPC error:", rpcError);
        throw new Error(rpcError.message || "Erro ao criar organização");
      }

      if (!result?.id) {
        throw new Error("Resposta inválida do servidor");
      }

      reset();
      toast.success("Painel criado com sucesso! 🚀");
      router.push("/dashboard");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Algo deu errado";
      console.error("Onboarding error:", error);
      toast.error(message);
      setIsSubmitting(false);
    }
  };

  const steps = [
    <StepBusinessType key="business-type" />,
    <StepGoals key="goals" />,
    <StepRevenue key="revenue" />,
    <StepGrowthStage key="growth-stage" />,
    <StepChannels key="channels" onComplete={handleComplete} isSubmitting={isSubmitting} />,
  ];

  return (
    <OnboardingShell>
      {steps[currentStep]}
    </OnboardingShell>
  );
}
