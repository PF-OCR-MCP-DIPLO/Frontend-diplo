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
      content: `Este panel ofrece orientacion local basada en la cantidad de hallazgos detectados (${errors}). No consulta un modelo externo ni modifica el backend por si solo.`,
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
    <Card className="flex h-full flex-col">
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center gap-2">
                  <Bot className="size-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Asistente de revision</h3>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Sugerencias guiadas para la demo. No reemplaza la validacion humana ni persiste cambios automaticamente.
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
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <Bot className="size-4 text-blue-600" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
              {message.role === "user" && (
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-200">
                  <User className="size-4 text-gray-600" />
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="¿Por qué este error?"
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
