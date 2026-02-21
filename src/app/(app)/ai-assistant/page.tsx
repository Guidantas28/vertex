"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, User, Lightbulb, TrendingUp, Target } from "lucide-react";
import { Topbar } from "@/components/common/topbar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  { icon: TrendingUp, label: "Como aumentar minha conversão de leads?", color: "text-violet-500 bg-violet-50 dark:bg-violet-950/30" },
  { icon: Target, label: "Quais leads devo priorizar hoje?", color: "text-blue-500 bg-blue-50 dark:bg-blue-950/30" },
  { icon: Lightbulb, label: "Sugestão de mensagem para reativar clientes", color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30" },
  { icon: Sparkles, label: "Análise do meu desempenho este mês", color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30" },
];

const INITIAL_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: "Olá! 👋 Sou seu assistente de crescimento com IA. Posso te ajudar a entender seus dados, criar estratégias, sugerir textos para campanhas e muito mais. O que você precisa hoje?",
};

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return;
    setInput("");
    setLoading(true);

    const msgId = crypto.randomUUID();
    const userMessage: Message = {
      id: msgId,
      role: "user",
      content,
    };
    setMessages((prev) => [...prev, userMessage]);

    // Simulate AI response
    await new Promise((r) => setTimeout(r, 1500));

    const aiMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "Excelente pergunta! Com base nos seus dados atuais, aqui está minha análise:\n\n**📊 Situação atual:**\nVocê tem 36 leads este mês com taxa de conversão de 24%, o que está acima da média do seu setor (18%).\n\n**💡 Recomendações:**\n1. Há 3 leads sem contato há mais de 48h — entrar em contato agora pode recuperar essas oportunidades\n2. Seu melhor horário de engajamento é 10h-11h\n3. Leads vindos do Instagram têm 35% mais taxa de conversão\n\n**🎯 Próxima ação:** Envie uma mensagem de follow-up para Vanessa, Carlos e Ana. Posso escrever uma mensagem personalizada para você?",
    };

    setMessages((prev) => [...prev, aiMessage]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="IA Assistente"
        description="Insights e estratégias personalizadas"
      />

      <div className="flex flex-col flex-1 max-w-3xl mx-auto w-full">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index === messages.length - 1 ? 0 : 0 }}
                className={cn(
                  "flex gap-3",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  {msg.role === "assistant" ? (
                    <AvatarFallback className="gradient-brand">
                      <Sparkles className="h-4 w-4 text-white" />
                    </AvatarFallback>
                  ) : (
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-card border border-border text-foreground rounded-bl-sm shadow-card"
                  )}
                >
                  <div
                    className="whitespace-pre-wrap leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: msg.content
                        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                        .replace(/\n/g, "<br />"),
                    }}
                  />
                </div>
              </motion.div>
            ))}

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="gradient-brand">
                    <Sparkles className="h-4 w-4 text-white" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3 shadow-card">
                  <div className="flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="h-2 w-2 rounded-full bg-primary"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Suggestions */}
          {messages.length === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <p className="text-xs text-muted-foreground text-center">Sugestões para começar</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUGGESTIONS.map(({ icon: Icon, label, color }) => (
                  <button
                    key={label}
                    onClick={() => sendMessage(label)}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-left text-sm hover:border-primary/50 hover:bg-accent transition-all duration-150"
                  >
                    <div className={`rounded-lg p-1.5 shrink-0 ${color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-foreground">{label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border bg-card/50">
          <div className="flex items-end gap-2">
            <textarea
              placeholder="Pergunte qualquer coisa sobre seu negócio..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              rows={1}
              className="flex-1 resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring transition-all max-h-32 overflow-y-auto"
            />
            <Button
              size="icon-sm"
              variant="gradient"
              className="h-10 w-10 rounded-xl shrink-0"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-center text-[10px] text-muted-foreground mt-2">
            IA pode cometer erros. Verifique informações importantes.
          </p>
        </div>
      </div>
    </div>
  );
}
