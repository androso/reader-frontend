
"use client"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizontal } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { memo, useState } from "react";

const MessageList = memo(({ messages, setOpen }: { messages: any, setOpen: (state:boolean) => void }) => (
  <>
    <div className="flex justify-end p-2 border-b">
      <button
         onClick={() => setOpen(false)} 
        className="text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
      </button>
    </div>
    <ScrollArea className="h-[263px] p-4">
      {messages.map((message: any, index: number) => (
        <div
          key={index}
          className={`mb-4 ${
            message.role === "assistant"
              ? "text-blue-600"
              : "text-gray-700"
          }`}
        >
          <p className="text-sm">{message.content}</p>
        </div>
      ))}
    </ScrollArea>
  </>
));

MessageList.displayName = "MessageList";

export function ChatInterface({ floating = false}: {floating?: boolean}) {
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsOpen(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.text }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, there was an error processing your request." }]);
    }
  };
  
  return (
    <div className={`flex flex-col ${floating && "absolute bottom-2 w-11/12 left-1/2 -translate-x-1/2 shadow-lg shadow-blue-500/50 rounded-md border-2 border-slate-300"} shadow-lg bg-white`}>
      {isOpen && (
        <MessageList messages={messages} setOpen={setIsOpen} />
      )}
      <form 
        onSubmit={handleSubmit}
        className="border-t border-gray-200 p-4"
      >
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this book..."
            className="flex-1"
          />
          <Button type="submit" size="icon" variant="ghost">
            <SendHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}
