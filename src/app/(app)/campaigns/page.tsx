import { createClient } from "@/lib/supabase/server";
import { CampaignsContent } from "./campaigns-content";

export default async function CampaignsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id) {
    return <CampaignsContent campaigns={[]} orgId="" />;
  }

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*")
    .eq("organization_id", profile.organization_id)
    .order("created_at", { ascending: false });

  return (
    <CampaignsContent
      campaigns={campaigns ?? []}
      orgId={profile.organization_id}
    />
  );
}
