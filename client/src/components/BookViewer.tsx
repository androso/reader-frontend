import { useState } from "react";
import { ReactReader } from "@/components/reader/ReactReader/ReactReader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Ghost } from "lucide-react";

interface BookViewerProps {
  bookId: string;
}

export function BookViewer({ bookId }: BookViewerProps) {
  const [location, setLocation] = useState<string | number>(0);
  const [error, setError] = useState<string | null>(null);
  const [selection, setSelection] = useState<{ text: string; x: number; y: number } | null>(null);
  const { toast } = useToast();

  const handleTextSelected = (cfiRange: string, contents: any) => {
    const selectedText = contents.window.getSelection().toString().trim();
    if (selectedText) {
      const range = contents.window.getSelection().getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelection({
        text: selectedText,
        x: rect.left + (rect.width / 2),
        y: rect.top - 10
      });
    } else {
      setSelection(null);
    }
  };
  
  return (
    <TooltipProvider>
      <ScrollArea className="flex-1 bg-background [&_.arrow]:hidden">
        <div 
          className="min-h-[calc(100vh-4rem)] w-full mx-auto max-w-2xl"
          style={{ height: 'calc(100vh - 4rem)', position: 'relative' }}
        >
          {selection && (
            <div
              style={{
                position: 'absolute',
                left: selection.x,
                top: selection.y,
                transform: 'translate(-50%, -100%)',
                zIndex: 50
              }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => {
                      // TODO: Implement Claude chat integration
                      console.log('Selected text:', selection.text);
                    }}
                  >
                    <Ghost className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ask Claude about this text</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
          <ReactReader
            url={`/api/books/${bookId}`}
            location={location}
            locationChanged={(loc: string | number) => setLocation(loc)}
            showToc={true}
            loadingView={<div className="p-4">Loading EPUB file...</div>}
            epubInitOptions={{
              openAs: 'epub',
            }}
            epubOptions={{
              flow: "scrolled",
              manager: "continuous",
            }}
            handleTextSelected={handleTextSelected}
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
          />
        </div>
      </ScrollArea>
    </TooltipProvider>
  );
}
