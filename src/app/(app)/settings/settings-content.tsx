"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Building, Bell, CreditCard, Link, Shield, Loader2, Check } from "lucide-react";
import { Topbar } from "@/components/common/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Profile, Organization } from "@/types/database";

const SETTINGS_SECTIONS: { id: string; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Perfil", icon: User },
  { id: "organization", label: "Negócio", icon: Building },
  { id: "notifications", label: "Notificações", icon: Bell },
  { id: "integrations", label: "Integrações", icon: Link },
  { id: "billing", label: "Plano & Pagamento", icon: CreditCard },
  { id: "security", label: "Segurança", icon: Shield },
];

interface SettingsContentProps {
  profile: Profile | null;
  organization: Record<string, unknown> | null;
  userEmail: string;
}

export function SettingsContent({ profile, organization, userEmail }: SettingsContentProps) {
  const [activeSection, setActiveSection] = useState("profile");

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Configurações" description="Gerencie seu perfil e negócio" />

      <div className="flex flex-1 overflow-hidden max-w-5xl mx-auto w-full p-6 gap-6">
        <div className="w-56 shrink-0 space-y-1">
          {SETTINGS_SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={cn(
                "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-150",
                activeSection === id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-0">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeSection === "profile" && (
              <ProfileSettings profile={profile} userEmail={userEmail} />
            )}
            {activeSection === "organization" && (
              <OrganizationSettings organization={organization} />
            )}
            {activeSection === "notifications" && <NotificationSettings />}
            {activeSection === "integrations" && <IntegrationsSettings />}
            {activeSection === "billing" && <BillingSettings plan={(organization as Organization | null)?.plan ?? "free"} />}
            {activeSection === "security" && <SecuritySettings />}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function ProfileSettings({ profile, userEmail }: { profile: Profile | null; userEmail: string }) {
  const [form, setForm] = useState({
    full_name: profile?.full_name ?? "",
    phone: profile?.phone ?? "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: form.full_name, phone: form.phone || null })
      .eq("id", profile.id);
    if (error) {
      toast.error("Erro ao salvar perfil");
    } else {
      toast.success("Perfil atualizado!");
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Perfil</h2>
        <p className="text-sm text-muted-foreground">Atualize suas informações pessoais.</p>
      </div>
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl gradient-brand flex items-center justify-center">
              <span className="text-white text-xl font-bold">
                {form.full_name?.charAt(0)?.toUpperCase() ?? "?"}
              </span>
            </div>
            <div>
              <Button variant="outline" size="sm">Alterar foto</Button>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG até 5MB</p>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nome completo"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
            <Input
              label="Telefone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              type="tel"
              placeholder="(11) 99999-9999"
            />
          </div>
          <Input label="Email" defaultValue={userEmail} type="email" disabled />
          <div className="flex justify-end">
            <Button variant="gradient" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Salvando...</> : "Salvar alterações"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function OrganizationSettings({ organization }: { organization: Record<string, unknown> | null }) {
  const org = organization as Organization | null;
  const [form, setForm] = useState({
    name: org?.name ?? "",
    business_type: org?.business_type ?? "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!org) return;
    setIsSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("organizations")
      .update({ name: form.name, business_type: (form.business_type as import("@/types/database").BusinessType) || null })
      .eq("id", org.id);
    if (error) {
      toast.error("Erro ao salvar");
    } else {
      toast.success("Negócio atualizado!");
    }
    setIsSaving(false);
  };

  const BUSINESS_TYPES = [
    { value: "clinic", label: "Clínica / Saúde" },
    { value: "service_provider", label: "Prestador de Serviços" },
    { value: "local_business", label: "Negócio Local" },
    { value: "freelancer", label: "Freelancer" },
    { value: "agency", label: "Agência" },
    { value: "ecommerce", label: "E-commerce" },
    { value: "other", label: "Outro" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Negócio</h2>
        <p className="text-sm text-muted-foreground">Informações da sua empresa.</p>
      </div>
      <Card>
        <CardContent className="p-6 space-y-4">
          <Input
            label="Nome do negócio"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Segmento</label>
            <select
              value={form.business_type}
              onChange={(e) => setForm({ ...form, business_type: e.target.value })}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Selecione...</option>
              {BUSINESS_TYPES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          {org && (
            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
              <span className="text-xs text-muted-foreground">Plano atual:</span>
              <span className="text-xs font-semibold capitalize text-primary">{org.plan}</span>
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="gradient" onClick={handleSave} disabled={isSaving || !form.name.trim()}>
              {isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Salvando...</> : "Salvar"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationSettings() {
  const [settings, setSettings] = useState([
    { id: "new_lead", label: "Novo lead adicionado", description: "Quando alguém entra no seu CRM", enabled: true },
    { id: "new_message", label: "Mensagem recebida", description: "Nova mensagem no WhatsApp", enabled: true },
    { id: "followup", label: "Lead sem contato (48h)", description: "Alertas de follow-up", enabled: true },
    { id: "campaign_done", label: "Campanha concluída", description: "Resultado de campanhas enviadas", enabled: false },
    { id: "weekly", label: "Relatório semanal", description: "Resumo do desempenho toda segunda", enabled: true },
  ]);

  const toggle = (id: string) => {
    setSettings((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Notificações</h2>
        <p className="text-sm text-muted-foreground">Controle quais alertas você recebe.</p>
      </div>
      <Card>
        <CardContent className="p-0 divide-y divide-border">
          {settings.map(({ id, label, description, enabled }) => (
            <div key={id} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <button
                onClick={() => toggle(id)}
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none",
                  enabled ? "bg-primary" : "bg-muted"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200",
                    enabled ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function IntegrationsSettings() {
  const integrations = [
    { name: "WhatsApp Business", icon: "💬", status: "connected", description: "Integração ativa" },
    { name: "Instagram", icon: "📸", status: "disconnected", description: "Conecte para receber leads" },
    { name: "Pix / Stripe", icon: "💳", status: "disconnected", description: "Receba pagamentos online" },
    { name: "Google Analytics", icon: "📊", status: "disconnected", description: "Rastreie conversões" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Integrações</h2>
        <p className="text-sm text-muted-foreground">Conecte as ferramentas que você usa.</p>
      </div>
      <div className="space-y-3">
        {integrations.map(({ name, icon, status, description }) => (
          <Card key={name}>
            <CardContent className="flex items-center gap-4 p-4">
              <span className="text-2xl">{icon}</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  {status === "connected" && <Check className="h-3 w-3 text-green-500" />}
                  {description}
                </p>
              </div>
              <Button variant={status === "connected" ? "outline" : "gradient"} size="sm">
                {status === "connected" ? "Gerenciar" : "Conectar"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function BillingSettings({ plan }: { plan: string }) {
  const plans = [
    { name: "Free", value: "free", price: "R$ 0", features: ["Até 50 leads", "100 mensagens/mês", "1 usuário"] },
    { name: "Starter", value: "starter", price: "R$ 97", features: ["Até 500 leads", "1.000 mensagens/mês", "3 usuários", "Relatórios básicos"] },
    { name: "Growth", value: "growth", price: "R$ 297", features: ["Leads ilimitados", "10.000 mensagens/mês", "10 usuários", "IA completa", "Campanhas avançadas"] },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Plano & Pagamento</h2>
        <p className="text-sm text-muted-foreground">Gerencie sua assinatura.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {plans.map(({ name, value, price, features }) => {
          const isCurrent = plan === value;
          return (
            <Card key={name} className={cn(isCurrent && "border-primary shadow-glow-sm")}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{name}</CardTitle>
                  {isCurrent && (
                    <span className="text-xs rounded-full bg-primary text-primary-foreground px-2 py-0.5 font-medium">
                      Atual
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold">{price}<span className="text-sm text-muted-foreground font-normal">/mês</span></p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button variant={isCurrent ? "outline" : "gradient"} size="sm" className="w-full" disabled={isCurrent}>
                  {isCurrent ? "Plano atual" : "Fazer upgrade"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function SecuritySettings() {
  const [form, setForm] = useState({ current: "", newPass: "", confirm: "" });
  const [isSaving, setIsSaving] = useState(false);

  const handleChangePassword = async () => {
    if (form.newPass !== form.confirm) {
      toast.error("As senhas não coincidem");
      return;
    }
    if (form.newPass.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres");
      return;
    }
    setIsSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: form.newPass });
    if (error) {
      toast.error("Erro ao alterar senha");
    } else {
      toast.success("Senha alterada com sucesso!");
      setForm({ current: "", newPass: "", confirm: "" });
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Segurança</h2>
        <p className="text-sm text-muted-foreground">Mantenha sua conta protegida.</p>
      </div>
      <Card>
        <CardContent className="p-6 space-y-4">
          <Input
            label="Nova senha"
            type="password"
            placeholder="Mínimo 8 caracteres"
            value={form.newPass}
            onChange={(e) => setForm({ ...form, newPass: e.target.value })}
          />
          <Input
            label="Confirmar nova senha"
            type="password"
            placeholder="Repita a senha"
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          />
          <div className="flex justify-end">
            <Button variant="gradient" onClick={handleChangePassword} disabled={isSaving || !form.newPass || !form.confirm}>
              {isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Alterando...</> : "Alterar senha"}
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Autenticação em dois fatores</p>
              <p className="text-xs text-muted-foreground">Adicione uma camada extra de segurança</p>
            </div>
            <Button variant="outline" size="sm">Ativar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
