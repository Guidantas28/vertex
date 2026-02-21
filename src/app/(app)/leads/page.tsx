import { createClient } from "@/lib/supabase/server";
import { LeadsContent } from "./leads-content";

export const metadata = {
  title: "Leads & CRM — Growth OS",
};

export default async function LeadsPage() {
  const supabase = await createClient();

  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  return <LeadsContent initialLeads={leads ?? []} />;
}
