import { useState } from "react";
import { useLocation } from "wouter";
import { FileUpload } from "@/components/FileUpload";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Library() {
  const [, setLocation] = useLocation();
  const [books, setBooks] = useState<{id: string, title: string}[]>([]);

  const handleFileUpload = async (file: File) => {
    // Stub - would normally upload to server
    const id = Math.random().toString(36).substring(7);
    setBooks([...books, {id, title: file.name}]);
  };

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold">Library</h1>
        <FileUpload onUpload={handleFileUpload} />
      </div>

      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map(book => (
            <Card key={book.id} className="p-4">
              <h3 className="font-medium mb-2">{book.title}</h3>
              <Button 
                onClick={() => setLocation(`/read/${book.id}`)}
                variant="outline"
              >
                Read
              </Button>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
