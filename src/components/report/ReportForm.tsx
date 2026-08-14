
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReportTypeForm from "./ReportTypeForm";
import LocationForm from "./LocationForm";
import PhotoUploadForm from "./PhotoUploadForm";
import ReporterInfo from "./ReporterInfo";
import SuccessScreen from "./SuccessScreen";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ReportForm = ({ onSuccess }: { onSuccess?: () => void } = {}) => {
  const [submitted, setSubmitted] = useState(false);
  const [animalType, setAnimalType] = useState("");
  const [condition, setCondition] = useState("");
  const [gpsPermission, setGpsPermission] = useState<boolean | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationDescription, setLocationDescription] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [description, setDescription] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [reporterContact, setReporterContact] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const isValid =
    !!animalType &&
    !!condition &&
    description.trim().length > 0 &&
    !!location &&
    locationDescription.length > 0 &&
    images.length >= 1 &&
    reporterName.trim().length > 0 &&
    reporterContact.trim().length > 0;

  const resetForm = () => {
    setSubmitted(false);
    setAnimalType("");
    setCondition("");
    setGpsPermission(null);
    setLocation(null);
    setLocationDescription([]);
    setImages([]);
    setDescription("");
    setReporterName("");
    setReporterContact("");
  };

  const handleSubmit = async () => {
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      let imageUrls: string[] = [];

      if (images.length > 0) {
        const uploadPromises = images.map(async (image, index) => {
          const fileName = `report_${Date.now()}_${index}.${image.name.split(".").pop()}`;
          const { error } = await supabase.storage.from("reports").upload(fileName, image);
          if (error) throw new Error(`Σφάλμα μεταφόρτωσης εικόνας: ${error.message}`);
          const {
            data: { publicUrl },
          } = supabase.storage.from("reports").getPublicUrl(fileName);
          return publicUrl;
        });
        imageUrls = await Promise.all(uploadPromises);
      }

      const reportData = {
        animal_type: animalType,
        condition,
        description,
        location_lat: location?.lat,
        location_lng: location?.lng,
        location_description: locationDescription.join(", "),
        image_urls: imageUrls,
        user_id: user?.id || "",
      };

      const { data: insertedReport, error } = await supabase
        .from("reports")
        .insert([reportData])
        .select()
        .single();

      if (error) throw error;

      if (user?.id) {
        await supabase.rpc("add_user_points", {
          user_id: user.id,
          activity_type: "report",
          points_to_add: 5,
          reference_id: insertedReport.id,
        });
      }

      setSubmitted(true);
      onSuccess?.();
      toast({
        title: "Επιτυχία!",
        description: "Η αναφορά σας καταχωρήθηκε επιτυχώς και κερδίσατε 5 πόντους!",
      });
    } catch (error: any) {
      console.error("Error submitting report:", error);
      toast({
        title: "Σφάλμα",
        description: error.message || "Σφάλμα κατά την καταχώρηση της αναφοράς",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return <SuccessScreen resetForm={resetForm} />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Αναφορά αδέσποτου</CardTitle>
          <p className="text-sm text-gray-600">
            Συμπληρώστε όλα τα πεδία και πατήστε «Καταχώρηση Αναφοράς».
          </p>
        </CardHeader>

        <CardContent className="space-y-8">
          <ReportTypeForm
            animalType={animalType}
            setAnimalType={setAnimalType}
            condition={condition}
            setCondition={setCondition}
            description={description}
            setDescription={setDescription}
          />

          <LocationForm
            gpsPermission={gpsPermission}
            setGpsPermission={setGpsPermission}
            location={location}
            setLocation={setLocation}
            locationDescription={locationDescription}
            setLocationDescription={setLocationDescription}
          />

          <PhotoUploadForm images={images} setImages={setImages} />

          <ReporterInfo
            reporterName={reporterName}
            setReporterName={setReporterName}
            reporterContact={reporterContact}
            setReporterContact={setReporterContact}
          />

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting}
              className="bg-strays-orange hover:bg-strays-orange/90"
            >
              {isSubmitting ? "Αποστολή..." : "Καταχώρηση Αναφοράς"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportForm;
