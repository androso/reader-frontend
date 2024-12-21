import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

export function FileUpload({ onUpload, isLoading }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.epub')) {
      toast({
        title: "Invalid file",
        description: "Please upload an EPUB file",
        variant: "destructive"
      });
      return;
    }

    onUpload(file);
    // try {
      // toast({
      //   title: "Success",
      //   description: "Book uploaded successfully"
      // });
    // } catch (err) {
    //   toast({
    //     title: "Error",
    //     description: "Failed to upload book",
    //     variant: "destructive"
    //   });
    // }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".epub"
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        onClick={() => inputRef.current?.click()}
        variant="outline"
        disabled={isLoading}
      >
        <Upload className="h-4 w-4 mr-2" />
        {isLoading ? "Uploading..." : "Upload EPUB"}
      </Button>
    </>
  );
}
