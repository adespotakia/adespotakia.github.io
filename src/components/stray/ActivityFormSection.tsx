
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import StrayActivityForm from "@/components/stray/StrayActivityForm";

interface ActivityFormSectionProps {
  formData: {
    stray_id: string;
    activity_type: string;
    activity_description: string;
    notes: string;
    food_type: string;
    activity_date: string;
    location_description?: string;
  };
  setFormData: (data: any) => void;
  straySearch: string;
  setStraySearch: (value: string) => void;
  selectedStray: any;
  setSelectedStray: (stray: any) => void;
  activityImages: File[];
  setActivityImages: (images: File[]) => void;
  coordinates: { lat: string; lng: string };
  setCoordinates: (coords: { lat: string; lng: string }) => void;
  searchResults: any[] | undefined;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

const ActivityFormSection = ({
  formData,
  setFormData,
  straySearch,
  setStraySearch,
  selectedStray,
  setSelectedStray,
  activityImages,
  setActivityImages,
  coordinates,
  setCoordinates,
  searchResults,
  onSubmit,
  isSubmitting
}: ActivityFormSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Καταγραφή Δραστηριότητας
        </CardTitle>
      </CardHeader>
      <CardContent>
        <StrayActivityForm
          formData={formData}
          setFormData={setFormData}
          straySearch={straySearch}
          setStraySearch={setStraySearch}
          selectedStray={selectedStray}
          setSelectedStray={setSelectedStray}
          activityImages={activityImages}
          setActivityImages={setActivityImages}
          coordinates={coordinates}
          setCoordinates={setCoordinates}
          searchResults={searchResults}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
        />
      </CardContent>
    </Card>
  );
};

export default ActivityFormSection;
