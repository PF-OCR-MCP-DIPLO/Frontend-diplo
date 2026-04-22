import { useState } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Send, Bot, User } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  errors: number;
}

export function AIChat({ errors }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: `Asistente local para revisar ${errors} hallazgo${errors === 1 ? "" : "s"}. No modifica datos por si solo.`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Los errores detectados corresponden a campos de monto que no tienen un formato numérico válido. Te recomiendo revisar las celdas marcadas en rojo y editarlas con el valor correcto.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  return (
    <Card className="flex h-full flex-col border-0 shadow-none">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <div className="icon-chip-primary size-10 rounded-full">
            <Bot className="size-5" />
          </div>
          <h3 className="font-semibold text-foreground">Asistente de revision</h3>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Sugerencias de apoyo. No reemplaza la validacion humana.
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="chat-avatar-assistant">
                  <Bot className="size-4" />
                </div>
              )}
              <div className={message.role === "user" ? "chat-bubble-user" : "chat-bubble-assistant"}>
                <p>{message.content}</p>
              </div>
              {message.role === "user" && (
                <div className="chat-avatar-user">
                  <User className="size-4" />
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t border-border/70 p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Pregunta por un hallazgo"
            className="flex-1"
          />
          <Button onClick={handleSend} size="icon">
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
