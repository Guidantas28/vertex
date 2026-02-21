import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { DashboardContent } from "./dashboard-content";

export const metadata = {
  title: "Dashboard — Growth OS",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: leads }, { data: metrics }, { data: conversations }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("*, organizations(*)")
        .eq("id", user!.id)
        .single(),
      supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("metrics")
        .select("*")
        .order("period", { ascending: true })
        .limit(7),
      supabase
        .from("conversations")
        .select("*")
        .eq("status", "open")
        .limit(5),
    ]);

  return (
    <Suspense fallback={<DashboardContent loading />}>
      <DashboardContent
        profile={profile}
        leads={leads ?? []}
        metrics={metrics ?? []}
        openConversations={conversations?.length ?? 0}
      />
    </Suspense>
  );
}
