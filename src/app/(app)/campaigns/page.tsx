"use client";

import { motion } from "framer-motion";
import { Megaphone, Plus, Send, Clock, CheckCircle2, PauseCircle, BarChart2 } from "lucide-react";
import { Topbar } from "@/components/common/topbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const MOCK_CAMPAIGNS = [
  {
    id: "1",
    name: "Reativação — Clientes Inativos",
    type: "whatsapp",
    status: "completed" as const,
    sent: 48,
    delivered: 45,
    read: 38,
    replies: 12,
    scheduledAt: "2026-02-15",
  },
  {
    id: "2",
    name: "Promoção de Fevereiro 🎉",
    type: "whatsapp",
    status: "running" as const,
    sent: 23,
    delivered: 22,
    read: 18,
    replies: 7,
    scheduledAt: "2026-02-20",
  },
  {
    id: "3",
    name: "Boas-vindas — Novos Leads",
    type: "whatsapp",
    status: "draft" as const,
    sent: 0,
    delivered: 0,
    read: 0,
    replies: 0,
    scheduledAt: null,
  },
];

const STATUS_CONFIG = {
  draft: { label: "Rascunho", variant: "secondary" as const, icon: PauseCircle, color: "text-muted-foreground" },
  scheduled: { label: "Agendada", variant: "warning" as const, icon: Clock, color: "text-amber-500" },
  running: { label: "Em execução", variant: "info" as const, icon: Send, color: "text-blue-500" },
  paused: { label: "Pausada", variant: "secondary" as const, icon: PauseCircle, color: "text-muted-foreground" },
  completed: { label: "Concluída", variant: "success" as const, icon: CheckCircle2, color: "text-emerald-500" },
};

export default function CampaignsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Campanhas"
        description="Disparo em massa e automações"
        actions={
          <Button size="sm" variant="gradient">
            <Plus className="h-4 w-4" />
            Nova Campanha
          </Button>
        }
      />

      <div className="flex-1 p-6 space-y-6 max-w-6xl mx-auto w-full">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total enviadas", value: "71", icon: Send, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
            { label: "Taxa de leitura", value: "84%", icon: BarChart2, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/30" },
            { label: "Respostas", value: "19", icon: Megaphone, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
            { label: "Campanhas ativas", value: "1", icon: CheckCircle2, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30" },
          ].map(({ label, value, icon: Icon, color, bg }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-xl border border-border bg-card p-4 flex items-center gap-3"
            >
              <div className={`rounded-lg p-2.5 ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Campaigns list */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Suas Campanhas
          </h3>
          {MOCK_CAMPAIGNS.map((campaign, index) => {
            const statusConfig = STATUS_CONFIG[campaign.status];
            const StatusIcon = statusConfig.icon;
            const readRate = campaign.sent > 0 ? Math.round((campaign.read / campaign.sent) * 100) : 0;
            const replyRate = campaign.sent > 0 ? Math.round((campaign.replies / campaign.sent) * 100) : 0;

            return (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.07 }}
              >
                <Card hover>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground">{campaign.name}</h4>
                          <Badge variant={statusConfig.variant}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          WhatsApp · {campaign.scheduledAt ? new Date(campaign.scheduledAt).toLocaleDateString("pt-BR") : "Não agendada"}
                        </p>
                      </div>
                      {campaign.status !== "draft" && (
                        <div className="hidden sm:flex items-center gap-6 text-center shrink-0">
                          {[
                            { label: "Enviadas", value: campaign.sent },
                            { label: "Entregues", value: campaign.delivered },
                            { label: "Lidas", value: `${readRate}%` },
                            { label: "Respostas", value: `${replyRate}%` },
                          ].map(({ label, value }) => (
                            <div key={label}>
                              <p className="text-base font-bold text-foreground">{value}</p>
                              <p className="text-[10px] text-muted-foreground">{label}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      <Button variant="outline" size="sm">
                        {campaign.status === "draft" ? "Editar" : "Ver detalhes"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
