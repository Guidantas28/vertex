"use client";

import { motion } from "framer-motion";
import { Plus, CheckCircle2, Clock, AlertCircle, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Topbar } from "@/components/common/topbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

const MOCK_TRANSACTIONS = [
  { id: "1", description: "Consultoria — Restaurante Bela Vista", amount: 3500, type: "income" as const, status: "paid" as const, due_date: "2026-02-20", paid_at: "2026-02-20", category: "Consultoria" },
  { id: "2", description: "Pacote Marketing — Studio Bela", amount: 2800, type: "income" as const, status: "pending" as const, due_date: "2026-02-25", paid_at: null, category: "Marketing" },
  { id: "3", description: "Ferramenta SaaS — Supabase", amount: 250, type: "expense" as const, status: "paid" as const, due_date: "2026-02-01", paid_at: "2026-02-01", category: "Ferramentas" },
  { id: "4", description: "Desenvolvimento — Clínica Vida", amount: 5200, type: "income" as const, status: "overdue" as const, due_date: "2026-02-10", paid_at: null, category: "Desenvolvimento" },
  { id: "5", description: "Design — Loja Artesanato", amount: 1800, type: "income" as const, status: "paid" as const, due_date: "2026-02-18", paid_at: "2026-02-18", category: "Design" },
];

const STATUS_CONFIG = {
  paid: { label: "Pago", variant: "success" as const, icon: CheckCircle2 },
  pending: { label: "Pendente", variant: "warning" as const, icon: Clock },
  overdue: { label: "Vencida", variant: "destructive" as const, icon: AlertCircle },
  cancelled: { label: "Cancelado", variant: "secondary" as const, icon: AlertCircle },
};

export default function PaymentsPage() {
  const totalIncome = MOCK_TRANSACTIONS.filter(t => t.type === "income" && t.status === "paid").reduce((s, t) => s + t.amount, 0);
  const totalPending = MOCK_TRANSACTIONS.filter(t => t.status === "pending" || t.status === "overdue").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = MOCK_TRANSACTIONS.filter(t => t.type === "expense" && t.status === "paid").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Pagamentos"
        description="Controle financeiro"
        actions={
          <Button size="sm" variant="gradient">
            <Plus className="h-4 w-4" />
            Nova Cobrança
          </Button>
        }
      />

      <div className="flex-1 p-6 space-y-6 max-w-6xl mx-auto w-full">
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Recebido este mês", value: formatCurrency(totalIncome), icon: ArrowDownLeft, change: "+12%", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
            { label: "A receber", value: formatCurrency(totalPending), icon: Clock, change: `${MOCK_TRANSACTIONS.filter(t => t.status === "pending" || t.status === "overdue").length} cobranças`, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30" },
            { label: "Despesas", value: formatCurrency(totalExpenses), icon: ArrowUpRight, change: "-5%", color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/30" },
          ].map(({ label, value, icon: Icon, change, color, bg }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{label}</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{change}</p>
                    </div>
                    <div className={`rounded-lg p-2.5 ${bg}`}>
                      <Icon className={`h-5 w-5 ${color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transações Recentes</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {MOCK_TRANSACTIONS.map((transaction, index) => {
                const statusConfig = STATUS_CONFIG[transaction.status];
                const StatusIcon = statusConfig.icon;

                return (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className={`rounded-full p-2 shrink-0 ${
                      transaction.type === "income"
                        ? "bg-emerald-50 dark:bg-emerald-950/30"
                        : "bg-rose-50 dark:bg-rose-950/30"
                    }`}>
                      {transaction.type === "income" ? (
                        <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-rose-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.category} · Vence{" "}
                        {new Date(transaction.due_date).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-semibold ${
                        transaction.type === "income"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}>
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                    <Badge variant={statusConfig.variant}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusConfig.label}
                    </Badge>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
