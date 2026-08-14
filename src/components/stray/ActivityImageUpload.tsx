
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { validateFiles } from "@/utils/fileValidation";
import ImageCropDialog from "@/components/common/ImageCropDialog";

interface ActivityImageUploadProps {
  images: File[];
  setImages: (images: File[]) => void;
}

const ActivityImageUpload = ({ images, setImages }: ActivityImageUploadProps) => {
  const { toast } = useToast();
  const [cropQueue, setCropQueue] = useState<File[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);
    const validationErrors = validateFiles([...images, ...selectedFiles]);

    if (validationErrors.length > 0) {
      toast({
        title: "Σφάλμα αρχείου",
        description: validationErrors[0].message,
        variant: "destructive",
      });
      e.target.value = '';
      return;
    }

    setCropQueue((q) => [...q, ...selectedFiles]);
    e.target.value = '';
  };

  const handleCropped = (file: File) => {
    setImages([...images, file]);
    setCropQueue((q) => q.slice(1));
  };

  const handleCancelCrop = () => setCropQueue((q) => q.slice(1));

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };


  return (
    <div className="space-y-2">
      <Label>Φωτογραφίες Δραστηριότητας *</Label>
      
      <div className="flex flex-col space-y-4">
        <Label
          htmlFor="activity-image-upload"
          className="cursor-pointer flex items-center justify-center p-6 border-2 border-dashed border-gray-300 hover:border-strays-orange rounded-md transition-colors"
        >
          <div className="text-center">
            <Upload className="mx-auto h-6 w-6 text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">
              Επιλέξτε φωτογραφίες δραστηριότητας *
            </span>
            <p className="text-xs text-gray-500 mt-1">
              Τουλάχιστον 1 εικόνα απαιτείται, έως 5 εικόνες, μέγιστο 5MB ανά αρχείο
            </p>
          </div>
        </Label>
        <Input
          id="activity-image-upload"
          type="file"
          className="hidden"
          accept=".jpg,.jpeg,.png,.webp,.gif"
          multiple
          onChange={handleImageUpload}
          required
        />
        
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {images.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Activity ${index + 1}`}
                  className="h-20 w-20 object-cover rounded-md border border-gray-200"
                />
                <button
                  type="button"
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <p className="text-xs text-gray-500">
        {images.length} από 5 εικόνες επιλεγμένες {images.length === 0 && "(Απαιτείται τουλάχιστον 1)"}
      </p>
      <ImageCropDialog
        file={cropQueue[0] ?? null}
        open={cropQueue.length > 0}
        onCancel={handleCancelCrop}
        onCropped={handleCropped}
      />
    </div>

  );
};

export default ActivityImageUpload;
