"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatRelativeDate, getInitials } from "@/lib/utils";
import type { Lead } from "@/types/database";

const STATUS_MAP: Record<Lead["status"], { label: string; variant: "success" | "warning" | "info" | "default" | "secondary" | "destructive" | "outline" }> = {
  new: { label: "Novo", variant: "info" },
  contacted: { label: "Contatado", variant: "default" },
  qualified: { label: "Qualificado", variant: "success" },
  proposal: { label: "Proposta", variant: "warning" },
  negotiation: { label: "Negociação", variant: "warning" },
  won: { label: "Ganho ✓", variant: "success" },
  lost: { label: "Perdido", variant: "destructive" },
};

interface RecentLeadsProps {
  leads: Lead[];
  loading?: boolean;
}

export function RecentLeads({ leads, loading = false }: RecentLeadsProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <div className="h-8 w-8 rounded-full shimmer-bg shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="shimmer-bg h-3 w-32 rounded" />
              <div className="shimmer-bg h-2.5 w-20 rounded" />
            </div>
            <div className="shimmer-bg h-5 w-16 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <span className="text-xl">🎯</span>
        </div>
        <p className="text-sm font-medium text-foreground">Nenhum lead ainda</p>
        <p className="text-xs text-muted-foreground mt-1">
          Adicione seu primeiro lead para começar
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {leads.map((lead, index) => {
        const status = STATUS_MAP[lead.status];
        return (
          <motion.div
            key={lead.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.06 }}
          >
            <Link
              href={`/leads/${lead.id}`}
              className="flex items-center gap-3 rounded-lg p-3 hover:bg-accent transition-colors group"
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="text-xs">
                  {getInitials(lead.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                  {lead.full_name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {lead.source || "Direto"} ·{" "}
                  {formatRelativeDate(lead.created_at)}
                </p>
              </div>
              <Badge variant={status.variant} className="shrink-0">
                {status.label}
              </Badge>
            </Link>
          </motion.div>
        );
      })}
      <Link
        href="/leads"
        className="flex items-center justify-center gap-1.5 py-3 text-xs text-muted-foreground hover:text-primary transition-colors group"
      >
        Ver todos os leads
        <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  );
}
