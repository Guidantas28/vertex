"use client";

import { motion } from "framer-motion";
import { BarChart2, TrendingUp, Users, MessageCircle, Download } from "lucide-react";
import { Topbar } from "@/components/common/topbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { formatCurrency } from "@/lib/utils";

const MONTHLY_DATA = [
  { month: "Set", revenue: 9800, leads: 18, conversions: 4 },
  { month: "Out", revenue: 11400, leads: 22, conversions: 6 },
  { month: "Nov", revenue: 10200, leads: 19, conversions: 5 },
  { month: "Dez", revenue: 13600, leads: 28, conversions: 8 },
  { month: "Jan", revenue: 15800, leads: 31, conversions: 9 },
  { month: "Fev", revenue: 18200, leads: 36, conversions: 11 },
];

const CHANNEL_DATA = [
  { name: "WhatsApp", value: 42 },
  { name: "Instagram", value: 28 },
  { name: "Indicação", value: 18 },
  { name: "Google", value: 8 },
  { name: "Outros", value: 4 },
];

export default function ReportsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Relatórios"
        description="Análise de desempenho"
        actions={
          <Button size="sm" variant="outline">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        }
      />

      <div className="flex-1 p-6 space-y-6 max-w-6xl mx-auto w-full">
        {/* Key metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Receita Total (6m)", value: formatCurrency(79000), icon: TrendingUp, trend: "+86%", color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/30" },
            { label: "Total de Leads", value: "154", icon: Users, trend: "+100%", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
            { label: "Conversões", value: "43", icon: BarChart2, trend: "+175%", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
            { label: "Ticket Médio", value: formatCurrency(1837), icon: MessageCircle, trend: "+24%", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30" },
          ].map(({ label, value, icon: Icon, trend, color, bg }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-xs text-muted-foreground font-medium">{label}</p>
                    <div className={`rounded-lg p-1.5 ${bg}`}>
                      <Icon className={`h-4 w-4 ${color}`} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{value}</p>
                  <p className="text-xs text-emerald-500 font-semibold mt-1">{trend} vs. início</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue trend */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Evolução de Receita</CardTitle>
              <CardDescription>Últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MONTHLY_DATA}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6272f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6272f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} width={35} />
                    <Tooltip formatter={(v) => [formatCurrency(v as number), "Receita"]} />
                    <Area type="monotone" dataKey="revenue" stroke="#6272f1" strokeWidth={2.5} fill="url(#revenueGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Channels */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Origem dos Leads</CardTitle>
              <CardDescription>Por canal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={CHANNEL_DATA} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={65} />
                    <Tooltip formatter={(v) => [`${v}%`, "Leads"]} />
                    <Bar dataKey="value" fill="#6272f1" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
