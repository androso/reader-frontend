import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { initReader } from "@/lib/epub";

interface BookViewerProps {
  bookId: string;
}

export function BookViewer({ bookId }: BookViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Initialize EPUB reader
    const cleanup = initReader(containerRef.current, bookId);
    return cleanup;
  }, [bookId]);

  return (
    <ScrollArea className="flex-1 bg-background">
      <div 
        ref={containerRef} 
        className="min-h-[calc(100vh-4rem)] w-full mx-auto max-w-2xl px-4 py-8 prose prose-sm prose-invert"
        style={{ height: 'calc(100vh - 4rem)' }}
      />
    </ScrollArea>
  );
}
