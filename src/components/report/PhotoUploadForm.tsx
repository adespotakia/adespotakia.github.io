import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { validateFiles, FileValidationError } from "@/utils/fileValidation";
import ImageCropDialog from "@/components/common/ImageCropDialog";

interface PhotoUploadFormProps {
  images: File[];
  setImages: (images: File[]) => void;
}

const PhotoUploadForm = ({ images, setImages }: PhotoUploadFormProps) => {
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
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Φωτογραφίες *</Label>
        <p className="text-sm text-gray-600">
          Απαιτείται τουλάχιστον 1 φωτογραφία (έως 5, μέγιστο 5MB ανά αρχείο)
        </p>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-2">
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
          </div>
          
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Uploaded ${index + 1}`}
                    className="h-24 w-24 object-cover rounded-md border border-gray-200"
                  />
                  <button
                    type="button"
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    onClick={() => removeImage(index)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
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

export default PhotoUploadForm;
