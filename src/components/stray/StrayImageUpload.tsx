import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ImageCropDialog from "@/components/common/ImageCropDialog";

interface StrayImageUploadProps {
  images: File[];
  setImages: (images: File[]) => void;
}

const StrayImageUpload = ({ images, setImages }: StrayImageUploadProps) => {
  const { toast } = useToast();
  const [cropQueue, setCropQueue] = useState<File[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);

    if (images.length + selectedFiles.length > 5) {
      toast({
        title: "Πάρα πολλές εικόνες",
        description: "Μπορείτε να ανεβάσετε έως 5 εικόνες",
        variant: "destructive",
      });
      e.target.value = '';
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 5 * 1024 * 1024;

    for (const file of selectedFiles) {
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Μη έγκυρος τύπος αρχείου",
          description: `Το αρχείο ${file.name} δεν είναι έγκυρη εικόνα`,
          variant: "destructive",
        });
        e.target.value = '';
        return;
      }
      if (file.size > maxSize) {
        toast({
          title: "Αρχείο πολύ μεγάλο",
          description: `Το αρχείο ${file.name} είναι μεγαλύτερο από 5MB`,
          variant: "destructive",
        });
        e.target.value = '';
        return;
      }
    }

    setCropQueue((q) => [...q, ...selectedFiles]);
    e.target.value = '';
  };

  const handleCropped = (file: File) => {
    setImages([...images, file]);
    setCropQueue((q) => q.slice(1));
  };

  const handleCancelCrop = () => {
    setCropQueue((q) => q.slice(1));
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };


  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="images">Φωτογραφίες *</Label>
        <p className="text-sm text-gray-600">
          Απαιτείται τουλάχιστον 1 φωτογραφία (έως 5, μέγιστο 5MB ανά αρχείο)
        </p>
        
        <div className="space-y-4">
          <Label
            htmlFor="image-upload"
            className={`cursor-pointer flex items-center justify-center p-8 border-2 border-dashed rounded-md transition-colors ${
              images.length === 0 
                ? 'border-red-300 hover:border-red-400' 
                : 'border-gray-300 hover:border-strays-orange'
            }`}
          >
            <div className="text-center">
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">
                Επιλέξτε φωτογραφίες
              </span>
              <p className="text-xs text-gray-500 mt-1">
                Επιτρέπονται: JPG, PNG, WebP, GIF
              </p>
            </div>
          </Label>
          
          <Input
            id="image-upload"
            type="file"
            className="hidden"
            accept=".jpg,.jpeg,.png,.webp,.gif"
            multiple
            onChange={handleImageUpload}
          />
          
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Φωτογραφία ${index + 1}`}
                    className="w-full h-24 object-cover rounded-md border border-gray-200"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <p className={`text-xs ${images.length === 0 ? 'text-red-500' : 'text-gray-500'}`}>
          {images.length} από 5 εικόνες επιλεγμένες
          {images.length === 0 && " - Απαιτείται τουλάχιστον 1"}
        </p>
      </div>
      <ImageCropDialog
        file={cropQueue[0] ?? null}
        open={cropQueue.length > 0}
        onCancel={handleCancelCrop}
        onCropped={handleCropped}
      />
    </div>

  );
};

export default StrayImageUpload;
