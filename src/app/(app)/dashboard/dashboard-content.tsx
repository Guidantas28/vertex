"use client";

import { motion } from "framer-motion";
import {
  DollarSign,
  Users,
  MessageCircle,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { Topbar } from "@/components/common/topbar";
import { MetricCard } from "@/components/dashboard/metric-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { RecentLeads } from "@/components/dashboard/recent-leads";
import { AIInsightCard } from "@/components/dashboard/ai-insight-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { Lead, Profile, Metric } from "@/types/database";

interface DashboardContentProps {
  loading?: boolean;
  profile?: (Profile & { organizations?: unknown }) | null;
  leads?: Lead[];
  metrics?: Metric[];
  openConversations?: number;
}

// Generate chart data from metrics or mock data
function buildChartData(metrics: Metric[]) {
  if (metrics.length > 0) {
    return metrics.map((m) => ({
      month: new Date(m.period).toLocaleDateString("pt-BR", { month: "short" }),
      revenue: Number(m.revenue),
      leads: m.leads_new,
    }));
  }
  // Demo data for empty state
  return [
    { month: "Ago", revenue: 8200, leads: 12 },
    { month: "Set", revenue: 9800, leads: 18 },
    { month: "Out", revenue: 11400, leads: 22 },
    { month: "Nov", revenue: 10200, leads: 19 },
    { month: "Dez", revenue: 13600, leads: 28 },
    { month: "Jan", revenue: 15800, leads: 31 },
    { month: "Fev", revenue: 18200, leads: 36 },
  ];
}

const DEMO_INSIGHTS = [
  {
    id: "1",
    title: "3 leads sem resposta há +48h",
    description:
      "Vanessa, Carlos e Ana não foram contactados. O follow-up rápido aumenta a conversão em 70%.",
    action: "Enviar mensagem",
    priority: "high" as const,
  },
  {
    id: "2",
    title: "Seu melhor horário é às 10h-11h",
    description:
      "Mensagens enviadas neste horário têm taxa de abertura 40% maior.",
    priority: "medium" as const,
  },
  {
    id: "3",
    title: "Campanha de retenção sugerida",
    description:
      "5 clientes não compram há 30 dias. Uma campanha de re-engajamento pode recuperá-los.",
    action: "Criar campanha",
    priority: "medium" as const,
  },
];

export function DashboardContent({
  loading = false,
  profile,
  leads = [],
  metrics = [],
  openConversations = 0,
}: DashboardContentProps) {
  const org = (profile as unknown as { organizations?: { name?: string; primary_goal?: string } } | null)?.organizations;
  const chartData = buildChartData(metrics);
  const totalRevenue = metrics.reduce((sum, m) => sum + Number(m.revenue), 0);
  const totalLeads = metrics.reduce((sum, m) => sum + m.leads_new, 0);
  const conversionRate =
    metrics.length > 0
      ? metrics[metrics.length - 1].conversion_rate
      : 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const goalMessages: Record<string, string> = {
    more_leads: "Novos leads esta semana",
    more_sales: "Receita este mês",
    better_retention: "Taxa de retenção",
    automate_processes: "Mensagens automáticas",
    understand_data: "Métricas disponíveis",
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Dashboard"
        description="Visão geral do seu crescimento"
      />

      <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Welcome message */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between"
        >
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {getGreeting()}, {profile?.full_name?.split(" ")[0] || "empreendedor"}{" "}
              👋
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {org?.name
                ? `${org.name} · `
                : ""}
              Aqui está o resumo do seu crescimento.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">
              {org?.primary_goal
                ? goalMessages[org.primary_goal] || "Dashboard personalizado"
                : "Dashboard personalizado"}
            </span>
          </div>
        </motion.div>

        {/* Quick actions */}
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Ações Rápidas
          </h3>
          <QuickActions />
        </div>

        {/* Metric cards */}
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Métricas Principais
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Receita Total"
              value={formatCurrency(totalRevenue || 18200)}
              change={12.4}
              changeLabel="vs. mês anterior"
              icon={<DollarSign className="h-4 w-4" />}
              color="violet"
              index={0}
              loading={loading}
            />
            <MetricCard
              title="Leads Novos"
              value={formatNumber(totalLeads || 36)}
              change={8.2}
              changeLabel="vs. mês anterior"
              icon={<Users className="h-4 w-4" />}
              color="blue"
              index={1}
              loading={loading}
            />
            <MetricCard
              title="Conversas Abertas"
              value={formatNumber(openConversations || 14)}
              change={-3.1}
              changeLabel="vs. ontem"
              icon={<MessageCircle className="h-4 w-4" />}
              color="emerald"
              index={2}
              loading={loading}
            />
            <MetricCard
              title="Taxa de Conversão"
              value={`${(conversionRate || 24).toFixed(1)}%`}
              change={2.8}
              changeLabel="vs. mês anterior"
              icon={<TrendingUp className="h-4 w-4" />}
              color="amber"
              index={3}
              loading={loading}
            />
          </div>
        </div>

        {/* Charts & sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">
                    Receita & Leads
                  </CardTitle>
                  <CardDescription>
                    Últimos 7 meses
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                    <span className="text-muted-foreground">Receita</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span className="text-muted-foreground">Leads</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <RevenueChart data={chartData} loading={loading} />
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg gradient-brand flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-base">IA Insights</CardTitle>
                  <CardDescription>Ações recomendadas</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <AIInsightCard insights={DEMO_INSIGHTS} loading={loading} />
            </CardContent>
          </Card>
        </div>

        {/* Recent Leads */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Leads Recentes</CardTitle>
                <CardDescription>
                  Últimos contatos adicionados
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RecentLeads leads={leads} loading={loading} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
