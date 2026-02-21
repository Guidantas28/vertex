"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MessageCircle,
  Bot,
  Send,
  Plus,
  CheckCheck,
  Smile,
  Paperclip,
  Mic,
} from "lucide-react";
import { Topbar } from "@/components/common/topbar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatRelativeDate, getInitials } from "@/lib/utils";
import type { Conversation } from "@/types/database";

interface WhatsAppContentProps {
  initialConversations: Conversation[];
}

// Mock messages for the selected conversation view
const MOCK_MESSAGES = [
  {
    id: "1",
    content: "Oi! Vi vocês no Instagram e quero saber mais sobre os serviços 😊",
    direction: "inbound" as const,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: "read" as const,
  },
  {
    id: "2",
    content:
      "Olá! Que ótimo! 🎉 Nossos serviços incluem consultoria completa e acompanhamento personalizado. O que você precisa especificamente?",
    direction: "outbound" as const,
    created_at: new Date(Date.now() - 3600000 * 1.8).toISOString(),
    status: "read" as const,
  },
  {
    id: "3",
    content: "Preciso de ajuda com marketing digital para o meu restaurante",
    direction: "inbound" as const,
    created_at: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    status: "read" as const,
  },
  {
    id: "4",
    content:
      "Perfeito! Temos um pacote especial para restaurantes que inclui gestão de redes sociais, campanhas de WhatsApp e análise de resultados. Posso te enviar mais detalhes?",
    direction: "outbound" as const,
    created_at: new Date(Date.now() - 3600000 * 1.2).toISOString(),
    status: "read" as const,
  },
  {
    id: "5",
    content: "Sim! Adorei. Quanto custa?",
    direction: "inbound" as const,
    created_at: new Date(Date.now() - 1800000).toISOString(),
    status: "read" as const,
  },
];

// Quick reply templates
const QUICK_REPLIES = [
  "Olá! Como posso ajudar? 😊",
  "Vou verificar e retorno em breve!",
  "Posso te enviar uma proposta?",
  "Quando prefere uma reunião?",
];

export function WhatsAppContent({ initialConversations }: WhatsAppContentProps) {
  const [conversations] = useState<Conversation[]>(initialConversations);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [showQuickReplies, setShowQuickReplies] = useState(false);

  const filtered = conversations.filter((c) =>
    !search ||
    c.contact_name.toLowerCase().includes(search.toLowerCase()) ||
    c.last_message?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSend = () => {
    if (!message.trim()) return;
    setMessage("");
    setShowQuickReplies(false);
  };

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 0px)" }}>
      <Topbar
        title="WhatsApp"
        description="Conversas e automações"
        actions={
          <Button size="sm" variant="gradient">
            <Bot className="h-4 w-4" />
            Automações
          </Button>
        }
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Conversations list */}
        <div className={cn(
          "flex flex-col border-r border-border bg-card",
          selected ? "hidden lg:flex lg:w-80 xl:w-96" : "flex-1 lg:flex lg:w-80 xl:w-96"
        )}>
          {/* Search */}
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="search"
                placeholder="Buscar conversas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring transition-all"
              />
            </div>
          </div>

          {/* Conversation items */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <EmptyConversations />
            ) : (
              filtered.map((conv, index) => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  isSelected={selected?.id === conv.id}
                  index={index}
                  onClick={() => setSelected(conv)}
                />
              ))
            )}
          </div>

          <div className="p-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Nova conversa
            </Button>
          </div>
        </div>

        {/* Chat view */}
        <div className={cn(
          "flex-1 flex flex-col bg-background",
          !selected && "hidden lg:flex"
        )}>
          {selected ? (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="lg:hidden"
                  onClick={() => setSelected(null)}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Button>
                <Avatar className="h-9 w-9">
                  <AvatarFallback>
                    {getInitials(selected.contact_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{selected.contact_name}</p>
                  <p className="text-xs text-emerald-500 font-medium">online</p>
                </div>
                <Badge variant="success" className="hidden sm:flex">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1" />
                  WhatsApp
                </Badge>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {MOCK_MESSAGES.map((msg, index) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className={cn(
                      "flex",
                      msg.direction === "outbound" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                        msg.direction === "outbound"
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-card border border-border text-foreground rounded-bl-sm shadow-card"
                      )}
                    >
                      <p className="leading-relaxed">{msg.content}</p>
                      <div className={cn(
                        "flex items-center gap-1 mt-1",
                        msg.direction === "outbound" ? "justify-end" : "justify-start"
                      )}>
                        <span className={cn(
                          "text-[10px]",
                          msg.direction === "outbound"
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        )}>
                          {formatRelativeDate(msg.created_at)}
                        </span>
                        {msg.direction === "outbound" && (
                          <CheckCheck className="h-3 w-3 text-primary-foreground/70" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Quick replies */}
              <AnimatePresence>
                {showQuickReplies && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="px-4 py-2 border-t border-border bg-card"
                  >
                    <p className="text-xs text-muted-foreground mb-2">Respostas rápidas</p>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_REPLIES.map((reply) => (
                        <button
                          key={reply}
                          onClick={() => {
                            setMessage(reply);
                            setShowQuickReplies(false);
                          }}
                          className="text-xs rounded-full border border-border px-3 py-1.5 hover:border-primary hover:text-primary transition-colors"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input area */}
              <div className="flex items-end gap-2 p-4 border-t border-border bg-card">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setShowQuickReplies(!showQuickReplies)}
                  className={showQuickReplies ? "text-primary" : ""}
                >
                  <Smile className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon-sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                  <textarea
                    placeholder="Digite uma mensagem..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    rows={1}
                    className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring transition-all max-h-32 overflow-y-auto"
                  />
                </div>
                {message.trim() ? (
                  <Button
                    size="icon-sm"
                    variant="gradient"
                    className="h-9 w-9 rounded-xl shrink-0"
                    onClick={handleSend}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button variant="ghost" size="icon-sm">
                    <Mic className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="h-16 w-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mb-4">
                <MessageCircle className="h-8 w-8 text-emerald-500" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                Selecione uma conversa
              </h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Escolha uma conversa à esquerda ou inicie uma nova.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ConversationItem({
  conversation,
  isSelected,
  index,
  onClick,
}: {
  conversation: Conversation;
  isSelected: boolean;
  index: number;
  onClick: () => void;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
        isSelected
          ? "bg-primary/10 border-r-2 border-primary"
          : "hover:bg-accent"
      )}
    >
      <div className="relative shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarFallback>
            {getInitials(conversation.contact_name)}
          </AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-card" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p
            className={cn(
              "text-sm font-semibold truncate",
              isSelected ? "text-primary" : "text-foreground"
            )}
          >
            {conversation.contact_name}
          </p>
          <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
            {conversation.last_message_at
              ? formatRelativeDate(conversation.last_message_at)
              : ""}
          </span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-xs text-muted-foreground truncate">
            {conversation.last_message || "Nenhuma mensagem"}
          </p>
          {conversation.unread_count > 0 && (
            <span className="ml-2 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {conversation.unread_count}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}

function EmptyConversations() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mb-3">
        <MessageCircle className="h-6 w-6 text-emerald-500" />
      </div>
      <p className="text-sm font-medium text-foreground">
        Nenhuma conversa ainda
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        Conecte seu WhatsApp para começar
      </p>
    </div>
  );
}
