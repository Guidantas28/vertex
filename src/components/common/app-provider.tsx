"use client";

import { useEffect } from "react";
import { useAppStore } from "@/stores/app.store";
import type { Organization, Profile } from "@/types/database";

interface AppProviderProps {
  profile: Profile;
  organization: Organization | null;
  children: React.ReactNode;
}

export function AppProvider({
  profile,
  organization,
  children,
}: AppProviderProps) {
  const { setProfile, setOrganization } = useAppStore();

  useEffect(() => {
    setProfile(profile);
    setOrganization(organization);
  }, [profile, organization, setProfile, setOrganization]);

  return <>{children}</>;
}
