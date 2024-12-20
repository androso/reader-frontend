import { useState } from "react";
import { ReactReader } from "@/components/reader/ReactReader/ReactReader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import useSelectionTooltip from "@/hooks/useSelectionTooltip";
import TextSelectionTooltip from "./ui/TextSelectionTooltip";

interface BookViewerProps {
  bookId: string;
}

export function BookViewer({ bookId }: BookViewerProps) {
  const [location, setLocation] = useState<string | number>(0);
  const { toast } = useToast();
  const { handleMouseDown, handleSelection, showTooltip, tooltipPosition } =
    useSelectionTooltip({
      minDragDistance: 5,
      tooltipOffset: 0,
    });
  return (
    <ScrollArea className="flex-1 bg-background [&_.arrow]:hidden">
      <div
        className="min-h-[calc(100vh-4rem)] w-full mx-auto max-w-2xl"
        style={{ height: "calc(100vh - 4rem)", position: "relative" }}
      >
        { showTooltip && (
        <TextSelectionTooltip
          position={tooltipPosition}
        >
          test
        </TextSelectionTooltip>
        )}

        <ReactReader
          url={`/api/books/${bookId}`}
          location={location}
          locationChanged={(loc: string | number) => setLocation(loc)}
          showToc={true}
          loadingView={<div className="p-4">Loading EPUB file...</div>}
          getRendition={(rendition) => {
            rendition.on("started", () => {
              console.log("EPUB started loading");
            });
            rendition.on("displayed", () => {
              console.log("EPUB page displayed");
            });
            rendition.on("rendered", () => {
              console.log("EPUB content rendered");
              const contents = rendition.getContents();
              
              if (contents) {
                const content = contents[0] as any;
                content.document.addEventListener("mousedown", (e) => {
                  handleMouseDown(e);
                });
                content.document.addEventListener("mouseup", (e) => {
                  handleSelection(e, content.document);
                });
              }
            });
          }}
          onError={(error) => {
            console.error("EPUB loading error:", error);
            toast({
              title: "Error",
              description: "Failed to load the EPUB file. Please try again.",
              variant: "destructive",
            });
          }}
        />
      </div>
    </ScrollArea>
  );
}
