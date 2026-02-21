import { create } from "zustand";
import type { Organization, Profile } from "@/types/database";

interface AppStore {
  organization: Organization | null;
  profile: Profile | null;
  sidebarOpen: boolean;
  setOrganization: (org: Organization | null) => void;
  setProfile: (profile: Profile | null) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  organization: null,
  profile: null,
  sidebarOpen: true,
  setOrganization: (organization) => set({ organization }),
  setProfile: (profile) => set({ profile }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
