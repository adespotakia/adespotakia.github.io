import { useEffect, useRef, useState } from "react";
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ImageCropDialogProps {
  file: File | null;
  open: boolean;
  onCancel: () => void;
  onCropped: (file: File) => void;
}

const ImageCropDialog = ({ file, open, onCancel, onCropped }: ImageCropDialogProps) => {
  const [src, setSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completed, setCompleted] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!file) {
      setSrc(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const c = centerCrop(
      makeAspectCrop({ unit: "%", width: 80 }, 1, width, height),
      width,
      height,
    );
    setCrop(c);
  };

  const handleSave = async () => {
    if (!imgRef.current || !completed || !file) return;
    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(completed.width * scaleX);
    canvas.height = Math.round(completed.height * scaleY);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(
      image,
      completed.x * scaleX,
      completed.y * scaleY,
      completed.width * scaleX,
      completed.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height,
    );
    const type = file.type.startsWith("image/") ? file.type : "image/jpeg";
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const cropped = new File([blob], file.name, { type, lastModified: Date.now() });
        onCropped(cropped);
      },
      type,
      0.92,
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Περικοπή εικόνας</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600">
          Σύρετε τις γωνίες για να κόψετε την εικόνα και να κρατήσετε μόνο το αδέσποτο.
        </p>
        <div className="flex justify-center bg-gray-50 rounded-md p-2 max-h-[60vh] overflow-auto">
          {src && (
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompleted(c)}
              keepSelection
            >
              <img ref={imgRef} src={src} alt="crop" onLoad={onImageLoad} style={{ maxHeight: "55vh" }} />
            </ReactCrop>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Άκυρο
          </Button>
          <Button type="button" onClick={handleSave} disabled={!completed}>
            Αποθήκευση περικοπής
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropDialog;
