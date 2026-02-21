"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Building, Bell, CreditCard, Link, Shield } from "lucide-react";
import { Topbar } from "@/components/common/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const SETTINGS_SECTIONS: { id: string; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Perfil", icon: User },
  { id: "organization", label: "Negócio", icon: Building },
  { id: "notifications", label: "Notificações", icon: Bell },
  { id: "integrations", label: "Integrações", icon: Link },
  { id: "billing", label: "Plano & Pagamento", icon: CreditCard },
  { id: "security", label: "Segurança", icon: Shield },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Configurações" description="Gerencie seu perfil e negócio" />

      <div className="flex flex-1 overflow-hidden max-w-5xl mx-auto w-full p-6 gap-6">
        {/* Sidebar nav */}
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

        {/* Content */}
        <div className="flex-1 min-w-0">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeSection === "profile" && <ProfileSettings />}
            {activeSection === "organization" && <OrganizationSettings />}
            {activeSection === "notifications" && <NotificationSettings />}
            {activeSection === "integrations" && <IntegrationsSettings />}
            {activeSection === "billing" && <BillingSettings />}
            {activeSection === "security" && <SecuritySettings />}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function ProfileSettings() {
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
              <span className="text-white text-xl font-bold">V</span>
            </div>
            <div>
              <Button variant="outline" size="sm">Alterar foto</Button>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG até 5MB</p>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nome completo" defaultValue="Vanessa Silva" />
            <Input label="Telefone" defaultValue="(11) 99999-9999" type="tel" />
          </div>
          <Input label="Email" defaultValue="vanessa@empresa.com" type="email" />
          <div className="flex justify-end">
            <Button variant="gradient">Salvar alterações</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function OrganizationSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Negócio</h2>
        <p className="text-sm text-muted-foreground">Informações da sua empresa.</p>
      </div>
      <Card>
        <CardContent className="p-6 space-y-4">
          <Input label="Nome do negócio" defaultValue="Clínica Vida Plena" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Segmento" defaultValue="Saúde / Clínica" />
            <Input label="CNPJ" placeholder="00.000.000/0001-00" />
          </div>
          <div className="flex justify-end">
            <Button variant="gradient">Salvar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationSettings() {
  const settings = [
    { label: "Novo lead adicionado", description: "Quando alguém entra no seu CRM", enabled: true },
    { label: "Mensagem recebida", description: "Nova mensagem no WhatsApp", enabled: true },
    { label: "Lead sem contato (48h)", description: "Alertas de follow-up", enabled: true },
    { label: "Campanha concluída", description: "Resultado de campanhas enviadas", enabled: false },
    { label: "Relatório semanal", description: "Resumo do desempenho toda segunda", enabled: true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Notificações</h2>
        <p className="text-sm text-muted-foreground">Controle quais alertas você recebe.</p>
      </div>
      <Card>
        <CardContent className="p-0 divide-y divide-border">
          {settings.map(({ label, description, enabled }) => (
            <div key={label} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <button
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
    { name: "WhatsApp Business", icon: "💬", status: "connected", description: "11 mensagens hoje" },
    { name: "Instagram", icon: "📸", status: "disconnected", description: "Conecte para receber leads" },
    { name: "Pix / Stripe", icon: "💳", status: "disconnected", description: "Receba pagamentos" },
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
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <Button
                variant={status === "connected" ? "outline" : "gradient"}
                size="sm"
              >
                {status === "connected" ? "Gerenciar" : "Conectar"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function BillingSettings() {
  const plans = [
    { name: "Free", price: "R$ 0", features: ["Até 50 leads", "100 mensagens/mês", "1 usuário"], current: false },
    { name: "Starter", price: "R$ 97", features: ["Até 500 leads", "1.000 mensagens/mês", "3 usuários", "Relatórios básicos"], current: true },
    { name: "Growth", price: "R$ 297", features: ["Leads ilimitados", "10.000 mensagens/mês", "10 usuários", "IA completa", "Campanhas avançadas"], current: false },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Plano & Pagamento</h2>
        <p className="text-sm text-muted-foreground">Gerencie sua assinatura.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {plans.map(({ name, price, features, current }) => (
          <Card key={name} className={cn(current && "border-primary shadow-glow-sm")}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{name}</CardTitle>
                {current && (
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
              <Button
                variant={current ? "outline" : "gradient"}
                size="sm"
                className="w-full"
                disabled={current}
              >
                {current ? "Plano atual" : "Fazer upgrade"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Segurança</h2>
        <p className="text-sm text-muted-foreground">Mantenha sua conta protegida.</p>
      </div>
      <Card>
        <CardContent className="p-6 space-y-4">
          <Input label="Senha atual" type="password" placeholder="••••••••" />
          <Input label="Nova senha" type="password" placeholder="Mínimo 8 caracteres" />
          <Input label="Confirmar nova senha" type="password" placeholder="••••••••" />
          <div className="flex justify-end">
            <Button variant="gradient">Alterar senha</Button>
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
