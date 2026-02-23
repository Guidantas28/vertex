"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Megaphone,
  Plus,
  Send,
  Clock,
  CheckCircle2,
  PauseCircle,
  BarChart2,
  X,
  Loader2,
} from "lucide-react";
import { Topbar } from "@/components/common/topbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/stores/app.store";
import { toast } from "sonner";
import type { Campaign } from "@/types/database";

const STATUS_CONFIG = {
  draft: { label: "Rascunho", variant: "secondary" as const, icon: PauseCircle, color: "text-muted-foreground" },
  scheduled: { label: "Agendada", variant: "warning" as const, icon: Clock, color: "text-amber-500" },
  running: { label: "Em execução", variant: "info" as const, icon: Send, color: "text-blue-500" },
  paused: { label: "Pausada", variant: "secondary" as const, icon: PauseCircle, color: "text-muted-foreground" },
  completed: { label: "Concluída", variant: "success" as const, icon: CheckCircle2, color: "text-emerald-500" },
};

interface CampaignsContentProps {
  campaigns: Campaign[];
  orgId: string;
}

export function CampaignsContent({ campaigns: initialCampaigns, orgId }: CampaignsContentProps) {
  const router = useRouter();
  const { profile } = useAppStore();
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "whatsapp" as "whatsapp" | "email" | "sms",
    message_template: "",
    scheduled_at: "",
  });

  const totalSent = campaigns.reduce((s, c) => s + c.sent_count, 0);
  const totalRead = campaigns.reduce((s, c) => s + c.read_count, 0);
  const totalReplies = campaigns.reduce((s, c) => s + c.reply_count, 0);
  const readRate = totalSent > 0 ? Math.round((totalRead / totalSent) * 100) : 0;
  const activeCount = campaigns.filter((c) => c.status === "running" || c.status === "scheduled").length;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !orgId || !profile) return;

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("campaigns")
        .insert({
          organization_id: orgId,
          name: form.name.trim(),
          type: form.type,
          message_template: form.message_template.trim() || null,
          scheduled_at: form.scheduled_at || null,
          status: "draft",
          created_by: profile.id,
        })
        .select()
        .single();

      if (error) throw error;
      setCampaigns((prev) => [data, ...prev]);
      toast.success("Campanha criada!");
      setShowModal(false);
      setForm({ name: "", type: "whatsapp", message_template: "", scheduled_at: "" });
    } catch {
      toast.error("Erro ao criar campanha");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Campanhas"
        description="Disparo em massa e automações"
        actions={
          <Button size="sm" variant="gradient" onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4" />
            Nova Campanha
          </Button>
        }
      />

      <div className="flex-1 p-6 space-y-6 max-w-6xl mx-auto w-full">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total enviadas", value: String(totalSent), icon: Send, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
            { label: "Taxa de leitura", value: `${readRate}%`, icon: BarChart2, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/30" },
            { label: "Respostas", value: String(totalReplies), icon: Megaphone, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
            { label: "Campanhas ativas", value: String(activeCount), icon: CheckCircle2, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30" },
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
        {campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4 text-3xl">
              📢
            </div>
            <h3 className="font-semibold text-foreground mb-1">Nenhuma campanha ainda</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Crie sua primeira campanha para começar a se comunicar com seus clientes
            </p>
            <Button variant="gradient" onClick={() => setShowModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Campanha
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Suas Campanhas ({campaigns.length})
            </h3>
            {campaigns.map((campaign, index) => {
              const statusConfig = STATUS_CONFIG[campaign.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.draft;
              const StatusIcon = statusConfig.icon;
              const readRate = campaign.sent_count > 0 ? Math.round((campaign.read_count / campaign.sent_count) * 100) : 0;
              const replyRate = campaign.sent_count > 0 ? Math.round((campaign.reply_count / campaign.sent_count) * 100) : 0;

              return (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card hover>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className="font-semibold text-foreground">{campaign.name}</h4>
                            <Badge variant={statusConfig.variant}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground capitalize">
                            {campaign.type} ·{" "}
                            {campaign.scheduled_at
                              ? new Date(campaign.scheduled_at).toLocaleDateString("pt-BR")
                              : "Não agendada"}
                          </p>
                        </div>
                        {campaign.status !== "draft" && (
                          <div className="hidden sm:flex items-center gap-6 text-center shrink-0">
                            {[
                              { label: "Enviadas", value: campaign.sent_count },
                              { label: "Entregues", value: campaign.delivered_count },
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
        )}
      </div>

      {/* Create Campaign Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold">Nova Campanha</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-accent">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input
                label="Nome da campanha"
                placeholder="Ex: Promoção de Março"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Canal</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Mensagem</label>
                <textarea
                  value={form.message_template}
                  onChange={(e) => setForm({ ...form, message_template: e.target.value })}
                  placeholder="Olá {nome}, temos uma oferta especial para você..."
                  rows={4}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <Input
                label="Agendamento (opcional)"
                type="datetime-local"
                value={form.scheduled_at}
                onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
              />
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="gradient" className="flex-1" disabled={isLoading || !form.name.trim()}>
                  {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Criando...</> : "Criar Campanha"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
