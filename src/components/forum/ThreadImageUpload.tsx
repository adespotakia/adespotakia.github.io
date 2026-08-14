
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { validateFiles, FileValidationError } from "@/utils/fileValidation";
import { useToast } from "@/hooks/use-toast";

interface ThreadImageUploadProps {
  images: File[];
  setImages: (images: File[]) => void;
  maxImages?: number;
}

const ThreadImageUpload = ({ images, setImages, maxImages = 3 }: ThreadImageUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const totalFiles = images.length + fileArray.length;

    if (totalFiles > maxImages) {
      toast({
        title: "Πολλές εικόνες",
        description: `Μπορείτε να ανεβάσετε μέχρι ${maxImages} εικόνες`,
        variant: "destructive",
      });
      return;
    }

    const errors: FileValidationError[] = validateFiles(fileArray);
    
    if (errors.length > 0) {
      errors.forEach(error => {
        toast({
          title: "Σφάλμα αρχείου",
          description: error.message,
          variant: "destructive",
        });
      });
      return;
    }

    setImages([...images, ...fileArray]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      <Label>Εικόνες (προαιρετικό)</Label>
      
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col items-center space-y-2">
          <ImageIcon className="h-8 w-8 text-gray-400" />
          <p className="text-sm text-gray-600">
            Σύρετε εικόνες εδώ ή κάντε κλικ για επιλογή
          </p>
          <p className="text-xs text-gray-500">
            Μέχρι {maxImages} εικόνες, έως 5MB η καθεμία
          </p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            id="thread-image-upload"
          />
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={() => document.getElementById('thread-image-upload')?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Επιλογή εικόνων
          </Button>
        </div>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={URL.createObjectURL(image)}
                alt={`Προεπισκόπηση ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThreadImageUpload;
