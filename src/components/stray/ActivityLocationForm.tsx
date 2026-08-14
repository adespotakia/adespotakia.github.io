
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MapPin, Locate } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AddressAutocomplete from "@/components/common/AddressAutocomplete";

interface ActivityLocationFormProps {
  locationDescription: string;
  setLocationDescription: (value: string) => void;
  coordinates: { lat: string; lng: string };
  setCoordinates: (coords: { lat: string; lng: string }) => void;
}

const ActivityLocationForm = ({ 
  locationDescription, 
  setLocationDescription,
  coordinates,
  setCoordinates
}: ActivityLocationFormProps) => {
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
      (error) => {
        toast({
          title: "Σφάλμα GPS",
          description: "Δεν μπόρεσε να καταγραφεί η τοποθεσία σας",
          variant: "destructive",
        });
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="h-4 w-4" />
        <Label className="text-base font-medium">Τοποθεσία Δραστηριότητας</Label>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={getCurrentLocation}
            className="flex items-center gap-1"
          >
            <Locate className="h-3 w-3" />
            Λήψη GPS *
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Γεωγραφικό Πλάτος</Label>
            <Input
              type="number"
              step="any"
              placeholder="π.χ. 37.9755"
              value={coordinates.lat}
              onChange={(e) => setCoordinates({ ...coordinates, lat: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Γεωγραφικό Μήκος</Label>
            <Input
              type="number"
              step="any"
              placeholder="π.χ. 23.7348"
              value={coordinates.lng}
              onChange={(e) => setCoordinates({ ...coordinates, lng: e.target.value })}
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Περιγραφή Τοποθεσίας</Label>
        <AddressAutocomplete
          value={locationDescription}
          onChange={setLocationDescription}
          onSelect={(r) => {
            if (r.lat !== undefined && r.lng !== undefined) {
              setCoordinates({ lat: r.lat.toString(), lng: r.lng.toString() });
            }
          }}
          placeholder="π.χ. Πλατεία Κεντρική Ξάνθης"
        />
      </div>


      <p className="text-xs text-gray-500">
        Μπορείτε να χρησιμοποιήσετε το GPS του κινητού σας για ακριβή συντεταγμένες
      </p>
    </div>
  );
};

export default ActivityLocationForm;
