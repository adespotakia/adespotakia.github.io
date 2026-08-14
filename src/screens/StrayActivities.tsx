
import { useNavigate } from "@/lib/router-compat";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useStrayActivities } from "@/hooks/useStrayActivities";
import ActivityFormSection from "@/components/stray/ActivityFormSection";

const StrayActivities = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const {
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
    handleSubmit,
    isSubmitting
  } = useStrayActivities();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">
              Παρακαλώ συνδεθείτε για να καταγράψετε δραστηριότητες αδέσποτων.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Επιστροφή
        </Button>
        <p className="text-gray-600 mb-4">
          Καταγράψτε δραστηριότητες φροντίδας για αδέσποτα ζώα
        </p>
      </div>
      
      <div className="max-w-2xl mx-auto">
        <ActivityFormSection
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
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default StrayActivities;
