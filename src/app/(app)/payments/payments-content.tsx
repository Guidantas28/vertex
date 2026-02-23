"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  Loader2,
} from "lucide-react";
import { Topbar } from "@/components/common/topbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import type { Transaction } from "@/types/database";

const STATUS_CONFIG = {
  paid: { label: "Pago", variant: "success" as const, icon: CheckCircle2 },
  pending: { label: "Pendente", variant: "warning" as const, icon: Clock },
  overdue: { label: "Vencida", variant: "destructive" as const, icon: AlertCircle },
  cancelled: { label: "Cancelado", variant: "secondary" as const, icon: AlertCircle },
};

interface PaymentsContentProps {
  transactions: Transaction[];
  orgId: string;
}

export function PaymentsContent({ transactions: initialTransactions, orgId }: PaymentsContentProps) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    description: "",
    amount: "",
    type: "income" as "income" | "expense",
    status: "pending" as "pending" | "paid",
    due_date: "",
    category: "",
  });

  const totalIncome = transactions.filter((t) => t.type === "income" && t.status === "paid").reduce((s, t) => s + t.amount, 0);
  const totalPending = transactions.filter((t) => t.status === "pending" || t.status === "overdue").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter((t) => t.type === "expense" && t.status === "paid").reduce((s, t) => s + t.amount, 0);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description.trim() || !form.amount || !orgId) return;

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("transactions")
        .insert({
          organization_id: orgId,
          description: form.description.trim(),
          amount: parseFloat(form.amount),
          type: form.type,
          status: form.status,
          due_date: form.due_date || null,
          category: form.category.trim() || null,
          paid_at: form.status === "paid" ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) throw error;
      setTransactions((prev) => [data, ...prev]);
      toast.success("Transação registrada!");
      setShowModal(false);
      setForm({ description: "", amount: "", type: "income", status: "pending", due_date: "", category: "" });
    } catch {
      toast.error("Erro ao registrar transação");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Pagamentos"
        description="Controle financeiro"
        actions={
          <Button size="sm" variant="gradient" onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4" />
            Nova Cobrança
          </Button>
        }
      />

      <div className="flex-1 p-6 space-y-6 max-w-6xl mx-auto w-full">
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Recebido este mês", value: formatCurrency(totalIncome), icon: ArrowDownLeft, change: `${transactions.filter(t => t.type === "income" && t.status === "paid").length} pagamentos`, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
            { label: "A receber", value: formatCurrency(totalPending), icon: Clock, change: `${transactions.filter(t => t.status === "pending" || t.status === "overdue").length} cobranças`, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30" },
            { label: "Despesas", value: formatCurrency(totalExpenses), icon: ArrowUpRight, change: `${transactions.filter(t => t.type === "expense").length} lançamentos`, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/30" },
          ].map(({ label, value, icon: Icon, change, color, bg }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
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
            <CardTitle className="text-base flex items-center justify-between">
              Transações ({transactions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-3xl mb-3">💳</div>
                <p className="text-sm font-medium text-foreground mb-1">Nenhuma transação ainda</p>
                <p className="text-xs text-muted-foreground mb-4">Registre suas receitas e despesas</p>
                <Button variant="gradient" size="sm" onClick={() => setShowModal(true)}>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Primeira Transação
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {transactions.map((transaction, index) => {
                  const statusConfig = STATUS_CONFIG[transaction.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
                  const StatusIcon = statusConfig.icon;

                  return (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.04 }}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-accent/50 transition-colors"
                    >
                      <div className={`rounded-full p-2 shrink-0 ${transaction.type === "income" ? "bg-emerald-50 dark:bg-emerald-950/30" : "bg-rose-50 dark:bg-rose-950/30"}`}>
                        {transaction.type === "income" ? (
                          <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-rose-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.category ?? "Sem categoria"} ·{" "}
                          {transaction.due_date
                            ? new Date(transaction.due_date).toLocaleDateString("pt-BR")
                            : "Sem vencimento"}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-sm font-semibold ${transaction.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                          {transaction.type === "income" ? "+" : "-"}{formatCurrency(transaction.amount)}
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
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold">Nova Transação</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-accent">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input
                label="Descrição"
                placeholder="Ex: Consultoria — Cliente ABC"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Tipo</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="income">Receita</option>
                    <option value="expense">Despesa</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as typeof form.status })}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="pending">Pendente</option>
                    <option value="paid">Pago</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Valor (R$)"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                />
                <Input
                  label="Categoria"
                  placeholder="Ex: Consultoria"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
              </div>
              <Input
                label="Vencimento"
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              />
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="gradient" className="flex-1" disabled={isLoading || !form.description.trim() || !form.amount}>
                  {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Salvando...</> : "Salvar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
