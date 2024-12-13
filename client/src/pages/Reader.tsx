import { useParams } from "wouter";
import { BookViewer } from "@/components/BookViewer";
import { ChatInput } from "@/components/ChatInput";

export function Reader() {
  const params = useParams();
  const bookId = params.bookId;

  return (
    <div className="h-screen w-screen flex flex-col">
      <BookViewer bookId={bookId} />
      <ChatInput />
    </div>
  );
}