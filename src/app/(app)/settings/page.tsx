import { createClient } from "@/lib/supabase/server";
import { SettingsContent } from "./settings-content";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profileRes, orgRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("profiles")
      .select("organization_id, organizations(*)")
      .eq("id", user.id)
      .single(),
  ]);

  const profile = profileRes.data;
  const organization = (orgRes.data?.organizations as Record<string, unknown> | null) ?? null;

  return (
    <SettingsContent
      profile={profile}
      organization={organization}
      userEmail={user.email ?? ""}
    />
  );
}
