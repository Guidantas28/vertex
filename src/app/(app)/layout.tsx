import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/common/sidebar";
import { AppProvider } from "@/components/common/app-provider";
import type { Organization } from "@/types/database";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, organizations(*)")
    .eq("id", user.id)
    .single();

  if (!profile?.organization_id) {
    redirect("/onboarding");
  }

  const organization = ((profile as unknown) as { organizations?: Organization | null })?.organizations ?? null;

  return (
    <AppProvider profile={profile} organization={organization}>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </AppProvider>
  );
}
