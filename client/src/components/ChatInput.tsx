import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizontal } from "lucide-react";

export function ChatInput() {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Stub - would normally send to API
    console.log("Sending message:", message);
    setMessage("");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
      <form 
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto flex gap-2 items-center"
      >
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1"
        />
        <Button type="submit" size="icon">
          <SendHorizontal className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
