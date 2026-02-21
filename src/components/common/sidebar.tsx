"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  MessageCircle,
  Megaphone,
  CreditCard,
  Sparkles,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app.store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    color: "text-violet-500",
  },
  {
    href: "/leads",
    icon: Users,
    label: "Leads & CRM",
    color: "text-blue-500",
  },
  {
    href: "/whatsapp",
    icon: MessageCircle,
    label: "WhatsApp",
    color: "text-emerald-500",
    badge: "3",
  },
  {
    href: "/campaigns",
    icon: Megaphone,
    label: "Campanhas",
    color: "text-orange-500",
  },
  {
    href: "/payments",
    icon: CreditCard,
    label: "Pagamentos",
    color: "text-pink-500",
  },
  {
    href: "/ai-assistant",
    icon: Sparkles,
    label: "IA Assistente",
    color: "text-amber-500",
  },
  {
    href: "/reports",
    icon: BarChart3,
    label: "Relatórios",
    color: "text-cyan-500",
  },
];

const BOTTOM_ITEMS = [
  { href: "/settings", icon: Settings, label: "Configurações" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarOpen, toggleSidebar, profile, organization } = useAppStore();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Até logo!");
    router.push("/login");
  };

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 240 : 64 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="relative flex flex-col border-r border-border bg-card h-screen sticky top-0 overflow-hidden shrink-0 z-30"
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-3 border-b border-border">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 rounded-lg gradient-brand flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">G</span>
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <span className="font-semibold text-sm text-foreground whitespace-nowrap">
                  Growth OS
                </span>
                {organization && (
                  <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                    {organization.name}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, icon: Icon, label, color, badge }) => {
          const isActive =
            pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-all duration-150",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute inset-0 rounded-lg bg-primary/10"
                  transition={{ duration: 0.2 }}
                />
              )}
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0 relative z-10 transition-colors",
                  isActive ? "text-primary" : color,
                  "group-hover:scale-110 transition-transform duration-150"
                )}
              />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative z-10 whitespace-nowrap flex-1"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
              {badge && sidebarOpen && (
                <span className="relative z-10 ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {badge}
                </span>
              )}
              {badge && !sidebarOpen && (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-2 py-3 border-t border-border space-y-0.5">
        {BOTTOM_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-all duration-150",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="whitespace-nowrap"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}

        {/* User profile */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-150"
        >
          <Avatar className="h-6 w-6 shrink-0">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback className="text-[10px]">
              {profile ? getInitials(profile.full_name || "U") : "U"}
            </AvatarFallback>
          </Avatar>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0 text-left"
              >
                <p className="text-xs font-medium text-foreground truncate">
                  {profile?.full_name || "Usuário"}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <LogOut className="h-3 w-3" />
                  Sair
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-[58px] z-40 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card shadow-card hover:shadow-card-hover transition-all duration-150 hover:scale-110"
      >
        {sidebarOpen ? (
          <ChevronLeft className="h-3 w-3 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
        )}
      </button>
    </motion.aside>
  );
}
