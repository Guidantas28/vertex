"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { UserPlus, MessageSquarePlus, Megaphone, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const ACTIONS = [
  {
    label: "Novo Lead",
    icon: UserPlus,
    href: "/leads/new",
    color: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
    hoverColor: "hover:bg-blue-100 dark:hover:bg-blue-950/50",
  },
  {
    label: "Nova Mensagem",
    icon: MessageSquarePlus,
    href: "/whatsapp/new",
    color: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400",
    hoverColor: "hover:bg-emerald-100 dark:hover:bg-emerald-950/50",
  },
  {
    label: "Nova Campanha",
    icon: Megaphone,
    href: "/campaigns/new",
    color: "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400",
    hoverColor: "hover:bg-orange-100 dark:hover:bg-orange-950/50",
  },
  {
    label: "Nova Cobrança",
    icon: FileText,
    href: "/payments/new",
    color: "bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400",
    hoverColor: "hover:bg-pink-100 dark:hover:bg-pink-950/50",
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {ACTIONS.map(({ label, icon: Icon, href, color, hoverColor }, index) => (
        <motion.div
          key={href}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link
            href={href}
            className={cn(
              "flex flex-col items-center gap-2.5 rounded-xl border border-border bg-card p-4 text-center transition-all duration-150",
              "shadow-card hover:shadow-card-hover",
              hoverColor
            )}
          >
            <div className={cn("rounded-lg p-2.5", color)}>
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium text-foreground">{label}</span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
