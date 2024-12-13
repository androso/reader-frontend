import { useState } from "react";
import { ReactReader } from "react-reader";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BookViewerProps {
  bookId: string;
}

export function BookViewer({ bookId }: BookViewerProps) {
  const [location, setLocation] = useState<string | number>(0);

  return (
    <ScrollArea className="flex-1 bg-background">
      <div 
        className="min-h-[calc(100vh-4rem)] w-full mx-auto max-w-2xl"
        style={{ height: 'calc(100vh - 4rem)', position: 'relative' }}
      >
        <ReactReader
          url={`/api/books/${bookId}`}
          location={location}
          locationChanged={(loc: string | number) => setLocation(loc)}
          showToc={true}
          epubOptions={{
            flow: "scrolled",
            manager: "continuous"
          }}
          styles={{
            container: {
              backgroundColor: 'transparent'
            },
            readerArea: {
              backgroundColor: 'transparent'
            }
          }}
        />
      </div>
    </ScrollArea>
  );
}
