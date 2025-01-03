
"use client"
import { useChat } from "ai/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizontal } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { memo } from "react";

const MessageList = memo(({ messages }: { messages: any }) => (
  <ScrollArea className="flex-1 p-4">
    {messages.map((message: any) => (
      <div
        key={message.id}
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
));

MessageList.displayName = "MessageList";

export function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  
  return (
    <div className="flex flex-col h-full">
      <MessageList messages={messages} />
      <form 
        onSubmit={handleSubmit}
        className="border-t border-gray-200 p-4"
      >
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
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
