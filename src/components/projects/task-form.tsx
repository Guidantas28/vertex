"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useProjectsStore } from "@/stores/projects.store";
import { useAppStore } from "@/stores/app.store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { TaskStatus } from "@/types/database";

interface TaskFormProps {
  projectId: string;
  defaultStatusId?: string;
  statuses: TaskStatus[];
  onClose: () => void;
}

export function TaskForm({ projectId, defaultStatusId, statuses, onClose }: TaskFormProps) {
  const { addTaskOptimistic } = useProjectsStore();
  const { profile } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium" as "urgent" | "high" | "medium" | "low",
    status_id: defaultStatusId ?? statuses[0]?.id ?? "",
    due_date: "",
    estimated_hours: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          project_id: projectId,
          title: form.title.trim(),
          description: form.description.trim() || null,
          priority: form.priority,
          status_id: form.status_id || null,
          due_date: form.due_date || null,
          estimated_hours: form.estimated_hours ? parseFloat(form.estimated_hours) : null,
          created_by: profile?.id ?? null,
          position: Date.now(),
        })
        .select()
        .single();

      if (error) throw error;

      addTaskOptimistic({ ...data, status: null, assignee: null, labels: [], subtasks: [] });
      toast.success("Tarefa criada!");
      onClose();
    } catch {
      toast.error("Erro ao criar tarefa");
    } finally {
      setIsLoading(false);
    }
  };

  const PRIORITIES = [
    { value: "urgent", label: "Urgente", color: "text-red-500" },
    { value: "high", label: "Alta", color: "text-orange-500" },
    { value: "medium", label: "Média", color: "text-yellow-500" },
    { value: "low", label: "Baixa", color: "text-slate-400" },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold">Nova Tarefa</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Título"
            placeholder="Ex: Implementar autenticação"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            autoFocus
          />

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Descrição</label>
            <textarea
              placeholder="Descreva a tarefa..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Status</label>
              <select
                value={form.status_id}
                onChange={(e) => setForm({ ...form, status_id: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {statuses.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Prioridade</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as typeof form.priority })}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Vencimento"
              type="date"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            />
            <Input
              label="Estimativa (horas)"
              type="number"
              min="0"
              step="0.5"
              placeholder="0"
              value={form.estimated_hours}
              onChange={(e) => setForm({ ...form, estimated_hours: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="gradient" className="flex-1" disabled={isLoading || !form.title.trim()}>
              {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Criando...</> : "Criar Tarefa"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
