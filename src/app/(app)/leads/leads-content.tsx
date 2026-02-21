"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Filter,
  LayoutGrid,
  LayoutList,
  Phone,
  Mail,
  MessageCircle,
  MoreHorizontal,
  ChevronRight,
  User,
} from "lucide-react";
import { Topbar } from "@/components/common/topbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { cn, formatCurrency, formatRelativeDate, getInitials } from "@/lib/utils";
import type { Lead } from "@/types/database";
import { AddLeadModal } from "@/components/leads/add-lead-modal";

const PIPELINE_STAGES: { status: Lead["status"]; label: string; color: string }[] = [
  { status: "new", label: "Novo", color: "bg-blue-500" },
  { status: "contacted", label: "Contatado", color: "bg-violet-500" },
  { status: "qualified", label: "Qualificado", color: "bg-amber-500" },
  { status: "proposal", label: "Proposta", color: "bg-orange-500" },
  { status: "negotiation", label: "Negociação", color: "bg-pink-500" },
  { status: "won", label: "Ganho", color: "bg-emerald-500" },
  { status: "lost", label: "Perdido", color: "bg-gray-400" },
];

const STATUS_BADGE: Record<Lead["status"], { label: string; variant: "success" | "warning" | "info" | "default" | "secondary" | "destructive" | "outline" }> = {
  new: { label: "Novo", variant: "info" },
  contacted: { label: "Contatado", variant: "default" },
  qualified: { label: "Qualificado", variant: "success" },
  proposal: { label: "Proposta", variant: "warning" },
  negotiation: { label: "Negociação", variant: "warning" },
  won: { label: "Ganho ✓", variant: "success" },
  lost: { label: "Perdido", variant: "destructive" },
};

interface LeadsContentProps {
  initialLeads: Lead[];
}

export function LeadsContent({ initialLeads }: LeadsContentProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [view, setView] = useState<"list" | "kanban">("list");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<Lead["status"] | "all">(
    "all"
  );
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        !search ||
        lead.full_name.toLowerCase().includes(search.toLowerCase()) ||
        lead.email?.toLowerCase().includes(search.toLowerCase()) ||
        lead.phone?.includes(search);
      const matchesStatus =
        filterStatus === "all" || lead.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [leads, search, filterStatus]);

  const leadsCountByStatus = useMemo(() => {
    return PIPELINE_STAGES.reduce(
      (acc, { status }) => {
        acc[status] = leads.filter((l) => l.status === status).length;
        return acc;
      },
      {} as Record<Lead["status"], number>
    );
  }, [leads]);

  const handleLeadAdded = (newLead: Lead) => {
    setLeads((prev) => [newLead, ...prev]);
    setShowAddModal(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Leads & CRM"
        description={`${leads.length} contatos`}
        actions={
          <Button
            size="sm"
            variant="gradient"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-4 w-4" />
            Novo Lead
          </Button>
        }
      />

      <div className="flex-1 p-6 space-y-5 max-w-7xl mx-auto w-full">
        {/* Pipeline overview */}
        <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
          {PIPELINE_STAGES.map(({ status, label, color }) => (
            <button
              key={status}
              onClick={() =>
                setFilterStatus(filterStatus === status ? "all" : status)
              }
              className={cn(
                "rounded-xl border p-3 text-left transition-all duration-150",
                filterStatus === status
                  ? "border-primary bg-primary/10 shadow-glow-sm"
                  : "border-border bg-card hover:border-primary/40 hover:bg-accent"
              )}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <div className={cn("h-2 w-2 rounded-full", color)} />
                <span className="text-xs text-muted-foreground font-medium truncate">
                  {label}
                </span>
              </div>
              <p className="text-lg font-bold text-foreground">
                {leadsCountByStatus[status] || 0}
              </p>
            </button>
          ))}
        </div>

        {/* Search & filter bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              placeholder="Buscar leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring focus:border-primary transition-all"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
          <div className="flex items-center rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setView("list")}
              className={cn(
                "flex items-center justify-center h-9 w-9 transition-colors",
                view === "list"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-accent"
              )}
            >
              <LayoutList className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("kanban")}
              className={cn(
                "flex items-center justify-center h-9 w-9 transition-colors",
                view === "kanban"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-accent"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Leads list */}
        <AnimatePresence mode="wait">
          {view === "list" ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-1"
            >
              {filtered.length === 0 ? (
                <EmptyLeads onAdd={() => setShowAddModal(true)} />
              ) : (
                filtered.map((lead, index) => (
                  <LeadRow key={lead.id} lead={lead} index={index} />
                ))
              )}
            </motion.div>
          ) : (
            <motion.div
              key="kanban"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <KanbanView leads={filtered} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AddLeadModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleLeadAdded}
      />
    </div>
  );
}

function LeadRow({ lead, index }: { lead: Lead; index: number }) {
  const status = STATUS_BADGE[lead.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3 hover:border-primary/30 hover:shadow-card-hover transition-all duration-150 group cursor-pointer"
    >
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarFallback className="text-xs">
          {getInitials(lead.full_name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
          {lead.full_name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {lead.phone && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Phone className="h-2.5 w-2.5" />
              {lead.phone}
            </span>
          )}
          {lead.email && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Mail className="h-2.5 w-2.5" />
              {lead.email}
            </span>
          )}
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-2">
        {lead.source && (
          <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-md bg-muted">
            {lead.source}
          </span>
        )}
        {lead.estimated_value && (
          <span className="text-xs font-semibold text-foreground">
            {formatCurrency(lead.estimated_value)}
          </span>
        )}
      </div>

      <Badge variant={status.variant}>{status.label}</Badge>

      <span className="hidden sm:block text-xs text-muted-foreground shrink-0">
        {formatRelativeDate(lead.created_at)}
      </span>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon-sm">
          <MessageCircle className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon-sm">
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </motion.div>
  );
}

function KanbanView({ leads }: { leads: Lead[] }) {
  const VISIBLE_STAGES = PIPELINE_STAGES.filter((s) => s.status !== "lost");

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {VISIBLE_STAGES.map(({ status, label, color }) => {
        const stageLeads = leads.filter((l) => l.status === status);
        return (
          <div key={status} className="shrink-0 w-64">
            <div className="flex items-center gap-2 mb-3">
              <div className={cn("h-2 w-2 rounded-full", color)} />
              <span className="text-xs font-semibold text-foreground">
                {label}
              </span>
              <span className="ml-auto text-xs text-muted-foreground">
                {stageLeads.length}
              </span>
            </div>
            <div className="space-y-2 min-h-[200px]">
              {stageLeads.map((lead) => (
                <Card
                  key={lead.id}
                  className="p-3 hover:border-primary/40 transition-colors cursor-pointer"
                  hover
                >
                  <div className="flex items-start gap-2">
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarFallback className="text-[10px]">
                        {getInitials(lead.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {lead.full_name}
                      </p>
                      {lead.phone && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {lead.phone}
                        </p>
                      )}
                      {lead.estimated_value && (
                        <p className="text-xs font-semibold text-primary mt-1">
                          {formatCurrency(lead.estimated_value)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-muted-foreground">
                      {formatRelativeDate(lead.created_at)}
                    </span>
                    <Button variant="ghost" size="icon-sm" className="h-5 w-5">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              ))}
              {stageLeads.length === 0 && (
                <div className="rounded-xl border-2 border-dashed border-border p-6 text-center">
                  <p className="text-xs text-muted-foreground">Nenhum lead</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EmptyLeads({ onAdd }: { onAdd: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="h-16 w-16 rounded-2xl gradient-brand flex items-center justify-center mb-4">
        <User className="h-8 w-8 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">
        Nenhum lead ainda
      </h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs">
        Adicione seu primeiro contato e comece a organizar seu funil de vendas.
      </p>
      <Button
        className="mt-6"
        variant="gradient"
        size="lg"
        onClick={onAdd}
      >
        <Plus className="h-4 w-4" />
        Adicionar primeiro lead
      </Button>
    </motion.div>
  );
}
