"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/stores/app.store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PROJECT_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#f59e0b", "#22c55e", "#14b8a6",
  "#0ea5e9", "#3b82f6",
];

const PROJECT_ICONS = ["📁", "🚀", "💡", "🎯", "⚡", "🔥", "🌟", "🏗️", "🎨", "📊"];

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateProjectModal({ open, onClose }: CreateProjectModalProps) {
  const router = useRouter();
  const { organization, profile } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    color: PROJECT_COLORS[0],
    icon: "📁",
    start_date: "",
    due_date: "",
  });

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !organization) return;

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("projects")
        .insert({
          organization_id: organization.id,
          name: form.name.trim(),
          description: form.description.trim() || null,
          color: form.color,
          icon: form.icon,
          owner_id: profile?.id ?? null,
          start_date: form.start_date || null,
          due_date: form.due_date || null,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Projeto criado com sucesso!");
      onClose();
      router.push(`/projects/${data.id}`);
    } catch (err) {
      toast.error("Erro ao criar projeto");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Novo Projeto</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Icon preview + name */}
          <div className="flex items-center gap-3">
            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
              style={{ backgroundColor: `${form.color}20`, border: `1px solid ${form.color}40` }}
            >
              {form.icon}
            </div>
            <Input
              label="Nome do projeto"
              placeholder="Ex: Lançamento do App"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Descrição <span className="text-muted-foreground font-normal">(opcional)</span>
            </label>
            <textarea
              placeholder="Descreva o objetivo do projeto..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Icon selector */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Ícone</label>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setForm({ ...form, icon })}
                  className={cn(
                    "h-9 w-9 rounded-lg text-lg flex items-center justify-center transition-all",
                    form.icon === icon
                      ? "bg-primary/20 ring-2 ring-primary"
                      : "hover:bg-accent"
                  )}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color selector */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Cor</label>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm({ ...form, color })}
                  className={cn(
                    "h-7 w-7 rounded-full transition-all",
                    form.color === color && "ring-2 ring-offset-2 ring-offset-card scale-110"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Data de início"
              type="date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
            />
            <Input
              label="Data de entrega"
              type="date"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="gradient" className="flex-1" disabled={isLoading || !form.name.trim()}>
              {isLoading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Criando...</>
              ) : (
                "Criar Projeto"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
