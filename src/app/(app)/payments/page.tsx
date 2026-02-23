import { createClient } from "@/lib/supabase/server";
import { PaymentsContent } from "./payments-content";

export default async function PaymentsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id) {
    return <PaymentsContent transactions={[]} orgId="" />;
  }

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("organization_id", profile.organization_id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <PaymentsContent
      transactions={transactions ?? []}
      orgId={profile.organization_id}
    />
  );
}
