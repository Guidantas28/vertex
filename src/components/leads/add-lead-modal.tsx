"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Phone, Mail, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Lead } from "@/types/database";

interface AddLeadModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (lead: Lead) => void;
}

const SOURCES = [
  "WhatsApp",
  "Instagram",
  "Indicação",
  "Google",
  "Site",
  "Ligação",
  "Outro",
];

export function AddLeadModal({ open, onClose, onAdd }: AddLeadModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [source, setSource] = useState("");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || loading) return;

    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();

      if (!profile?.organization_id) throw new Error("No organization");

      const { data: lead, error } = await supabase
        .from("leads")
        .insert({
          organization_id: profile.organization_id,
          full_name: name,
          phone: phone || null,
          email: email || null,
          source: source || null,
          estimated_value: value ? parseFloat(value.replace(",", ".")) : null,
          status: "new",
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(`Lead "${name}" adicionado!`);
      onAdd(lead);
      setName("");
      setPhone("");
      setEmail("");
      setSource("");
      setValue("");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao adicionar lead");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />
        </Dialog.Overlay>
        <Dialog.Content asChild>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-6 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <Dialog.Title className="text-lg font-semibold text-foreground">
                      Novo Lead
                    </Dialog.Title>
                    <Dialog.Description className="text-sm text-muted-foreground">
                      Adicione um novo contato ao seu CRM.
                    </Dialog.Description>
                  </div>
                  <Dialog.Close asChild>
                    <Button variant="ghost" size="icon-sm">
                      <X className="h-4 w-4" />
                    </Button>
                  </Dialog.Close>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Nome *"
                    placeholder="Nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    leftIcon={<User className="h-4 w-4" />}
                    required
                    autoFocus
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="WhatsApp"
                      placeholder="(11) 99999-9999"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      leftIcon={<Phone className="h-4 w-4" />}
                      type="tel"
                    />
                    <Input
                      label="Email"
                      placeholder="email@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      leftIcon={<Mail className="h-4 w-4" />}
                      type="email"
                    />
                  </div>

                  {/* Source */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">
                      Como chegou até você?
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {SOURCES.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSource(s === source ? "" : s)}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                            source === s
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Input
                    label="Valor estimado"
                    placeholder="0,00"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    leftIcon={<DollarSign className="h-4 w-4" />}
                    hint="Valor potencial do negócio (opcional)"
                  />

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={onClose}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      variant="gradient"
                      className="flex-1"
                      loading={loading}
                      disabled={!name.trim()}
                    >
                      Adicionar Lead
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
