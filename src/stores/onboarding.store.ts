import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BusinessType, GrowthGoal, GrowthStage } from "@/types/database";

export interface OnboardingData {
  // Step 1: Business type
  businessType: BusinessType | null;
  businessName: string;
  // Step 2: Goals
  primaryGoal: GrowthGoal | null;
  // Step 3: Revenue
  monthlyRevenueRange: string | null;
  // Step 4: Growth stage
  growthStage: GrowthStage | null;
  // Step 5: Channels
  channelsUsed: string[];
}

interface OnboardingStore {
  currentStep: number;
  data: OnboardingData;
  isCompleting: boolean;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateData: (data: Partial<OnboardingData>) => void;
  setCompleting: (value: boolean) => void;
  reset: () => void;
}

const initialData: OnboardingData = {
  businessType: null,
  businessName: "",
  primaryGoal: null,
  monthlyRevenueRange: null,
  growthStage: null,
  channelsUsed: [],
};

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      currentStep: 0,
      data: initialData,
      isCompleting: false,
      setStep: (step) => set({ currentStep: step }),
      nextStep: () =>
        set((state) => ({ currentStep: Math.min(state.currentStep + 1, 4) })),
      prevStep: () =>
        set((state) => ({ currentStep: Math.max(state.currentStep - 1, 0) })),
      updateData: (data) =>
        set((state) => ({ data: { ...state.data, ...data } })),
      setCompleting: (value) => set({ isCompleting: value }),
      reset: () => set({ currentStep: 0, data: initialData }),
    }),
    {
      name: "vertex-onboarding",
    }
  )
);
