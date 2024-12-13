import { useState } from "react";
import { ReactReader } from "react-reader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface BookViewerProps {
  bookId: string;
}

export function BookViewer({ bookId }: BookViewerProps) {
  const [location, setLocation] = useState<string | number>(0);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  return (
    <ScrollArea className="flex-1 bg-background [&_.arrow]:hidden">
      <div 
        className="min-h-[calc(100vh-4rem)] w-full mx-auto max-w-2xl"
        style={{ height: 'calc(100vh - 4rem)', position: 'relative' }}
      >
        <ReactReader
          url={`/api/books/${bookId}`}
          location={location}
          locationChanged={(loc: string | number) => setLocation(loc)}
          showToc={true}
          loadingView={<div className="p-4">Loading EPUB file...</div>}
          epubInitOptions={{
            openAs: 'epub'
          }}
          epubOptions={{
            flow: "scrolled",
            manager: "continuous",
          }}
          getRendition={(rendition) => {
            rendition.on('started', () => {
              console.log('EPUB started loading');
            });
            rendition.on('displayed', () => {
              console.log('EPUB page displayed');
            });
            rendition.on('rendered', () => {
              console.log('EPUB content rendered');
            });
          }}
          onError={(error) => {
            console.error('EPUB loading error:', error);
            toast({
              title: "Error",
              description: "Failed to load the EPUB file. Please try again.",
              variant: "destructive"
            });
          }}
        />
      </div>
    </ScrollArea>
  );
}
