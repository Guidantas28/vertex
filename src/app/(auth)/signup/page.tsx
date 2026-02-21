"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (password.length < 8) {
      toast.error("A senha deve ter no mínimo 8 caracteres");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
        },
      });

      if (error) throw error;

      toast.success("Conta criada! Vamos configurar seu painel.");
      router.push("/onboarding");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao criar conta";
      toast.error(
        message.includes("already registered")
          ? "Este email já está cadastrado"
          : message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm space-y-8"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg gradient-brand flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="font-semibold text-lg">Growth OS</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Crie sua conta grátis
          </h1>
          <p className="text-muted-foreground text-sm">
            Comece em segundos. Sem cartão de crédito.
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <Input
            label="Seu nome"
            type="text"
            placeholder="Maria Silva"
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftIcon={<User className="h-4 w-4" />}
            required
            autoComplete="name"
          />
          <Input
            label="Email"
            type="email"
            placeholder="voce@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="h-4 w-4" />}
            required
            autoComplete="email"
          />
          <Input
            label="Senha"
            type="password"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="h-4 w-4" />}
            required
            autoComplete="new-password"
            hint="Mínimo 8 caracteres"
          />
          <Button
            type="submit"
            size="lg"
            variant="gradient"
            className="w-full"
            loading={loading}
          >
            Criar conta e começar
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Ao criar uma conta você concorda com nossos{" "}
          <Link href="/terms" className="text-primary hover:underline">
            Termos de Uso
          </Link>{" "}
          e{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Política de Privacidade
          </Link>
          .
        </p>

        <p className="text-center text-sm text-muted-foreground">
          Já tem uma conta?{" "}
          <Link
            href="/login"
            className="text-primary font-medium hover:underline"
          >
            Entrar
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
