import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Locate } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AddressAutocomplete from "@/components/common/AddressAutocomplete";

interface GPSLocationSectionProps {
  coordinates: { lat: string; lng: string };
  setCoordinates: (coords: { lat: string; lng: string }) => void;
  locationDescription?: string;
  onLocationDescriptionChange?: (value: string) => void;
}

const GPSLocationSection = ({
  coordinates,
  setCoordinates,
  locationDescription = "",
  onLocationDescriptionChange,
}: GPSLocationSectionProps) => {
  const { toast } = useToast();

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Σφάλμα",
        description: "Το GPS δεν υποστηρίζεται από τον browser σας",
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          lat: position.coords.latitude.toString(),
          lng: position.coords.longitude.toString()
        });
        toast({
          title: "Επιτυχία",
          description: "Η τοποθεσία σας καταγράφηκε επιτυχώς",
        });
      },
      () => {
        toast({
          title: "Σφάλμα GPS",
          description: "Δεν μπόρεσε να καταγραφεί η τοποθεσία σας",
          variant: "destructive",
        });
      }
    );
  };

  return (
    <div className="space-y-3">
      {onLocationDescriptionChange && (
        <div className="space-y-1">
          <Label htmlFor="activity-location" className="text-sm">Τοποθεσία αδεσπότου</Label>
          <AddressAutocomplete
            id="activity-location"
            value={locationDescription}
            onChange={onLocationDescriptionChange}
            onSelect={(r) => {
              if (r.lat !== undefined && r.lng !== undefined) {
                setCoordinates({ lat: r.lat.toString(), lng: r.lng.toString() });
              }
            }}
            placeholder="π.χ. Βασιλέως Κωνσταντίνου, Ξάνθη"
          />
        </div>
      )}

      <div className="flex items-center justify-start">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={getCurrentLocation}
          className="flex items-center gap-2"
        >
          <Locate className="h-4 w-4" />
          Λήψη GPS
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="lat" className="text-sm">Γεωγραφικό πλάτος *</Label>
          <Input
            id="lat"
            type="number"
            step="any"
            placeholder="π.χ. 41.1354"
            value={coordinates.lat}
            onChange={(e) => setCoordinates({ ...coordinates, lat: e.target.value })}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="lng" className="text-sm">Γεωγραφικό μήκος *</Label>
          <Input
            id="lng"
            type="number"
            step="any"
            placeholder="π.χ. 24.8882"
            value={coordinates.lng}
            onChange={(e) => setCoordinates({ ...coordinates, lng: e.target.value })}
            required
          />
        </div>
      </div>
    </div>
  );
};

export default GPSLocationSection;
