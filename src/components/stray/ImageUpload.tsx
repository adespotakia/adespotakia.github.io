
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Upload, X } from "lucide-react";
import { validateFiles } from "@/utils/fileValidation";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  onImagesSelect: (files: File[]) => void;
  maxImages?: number;
  currentImages?: File[];
}

const ImageUpload = ({ onImagesSelect, maxImages = 5, currentImages = [] }: ImageUploadProps) => {
  const [previews, setPreviews] = useState<string[]>([]);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const totalImages = currentImages.length + files.length;
    if (totalImages > maxImages) {
      toast({
        title: "Πολλά αρχεία",
        description: `Μπορείτε να ανεβάσετε μέχρι ${maxImages} εικόνες`,
        variant: "destructive",
      });
      return;
    }

    // Validate files before processing
    const allFiles = [...currentImages, ...files];
    const validationErrors = validateFiles(allFiles);
    
    if (validationErrors.length > 0) {
      toast({
        title: "Σφάλμα αρχείου",
        description: validationErrors[0].message,
        variant: "destructive",
      });
      // Clear the input
      event.target.value = '';
      return;
    }

    const newImages = [...currentImages, ...files];
    onImagesSelect(newImages);

    // Create previews for new files
    const newPreviews = [...previews];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        setPreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });

    // Clear the input to allow re-selecting
    event.target.value = '';
  };

  const removeImage = (index: number) => {
    const newImages = currentImages.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    onImagesSelect(newImages);
    setPreviews(newPreviews);
  };

  return (
    <div className="space-y-4">
      {currentImages.length < maxImages && (
        <div className="flex gap-2">
          <div className="relative">
            <Input
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.gif"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="image-upload"
            />
            <Label htmlFor="image-upload" className="cursor-pointer">
              <Button type="button" variant="outline" asChild>
                <span>
                  <Upload className="mr-2 h-4 w-4" />
                  Επιλογή εικόνων
                </span>
              </Button>
            </Label>
          </div>
          
          <div className="relative">
            <Input
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.gif"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
              id="camera-capture"
            />
            <Label htmlFor="camera-capture" className="cursor-pointer">
              <Button type="button" variant="outline" asChild>
                <span>
                  <Camera className="mr-2 h-4 w-4" />
                  Λήψη φωτογραφίας
                </span>
              </Button>
            </Label>
          </div>
        </div>
      )}

      {currentImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-gray-200"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                onClick={() => removeImage(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <p className="text-sm text-gray-500">
        {currentImages.length} από {maxImages} εικόνες επιλεγμένες
        <br />
        <span className="text-xs">Επιτρέπονται: JPG, PNG, WebP, GIF (μέχρι 5MB ανά αρχείο)</span>
      </p>
    </div>
  );
};

export default ImageUpload;
