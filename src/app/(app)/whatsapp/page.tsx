import { createClient } from "@/lib/supabase/server";
import { WhatsAppContent } from "./whatsapp-content";

export const metadata = {
  title: "WhatsApp — Vertex",
};

export default async function WhatsAppPage() {
  const supabase = await createClient();

  const { data: conversations } = await supabase
    .from("conversations")
    .select("*")
    .eq("channel", "whatsapp")
    .order("last_message_at", { ascending: false });

  return <WhatsAppContent initialConversations={conversations ?? []} />;
}
