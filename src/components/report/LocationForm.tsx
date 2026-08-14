
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReportLocationMap from "./ReportLocationMap";
import AddressAutocomplete from "@/components/common/AddressAutocomplete";

interface LocationFormProps {
  gpsPermission: boolean | null;
  setGpsPermission: (permission: boolean) => void;
  location: { lat: number; lng: number } | null;
  setLocation: (location: { lat: number; lng: number } | null) => void;
  locationDescription: string[];
  setLocationDescription: (tags: string[]) => void;
}

const LocationForm = ({
  gpsPermission,
  setGpsPermission,
  location,
  setLocation,
  locationDescription,
  setLocationDescription,
}: LocationFormProps) => {
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  const { toast } = useToast();

  const address = locationDescription[0] ?? "";
  const setAddress = (value: string) => setLocationDescription(value ? [value] : []);

  const handleGPSRequest = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Σφάλμα",
        description: "Η γεωτοποθεσία δεν υποστηρίζεται από τον περιηγητή σας",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingGPS(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        setGpsPermission(true);
        setIsLoadingGPS(false);

        toast({
          title: "Τοποθεσία εντοπίστηκε",
          description: "Η θέση σας εμφανίζεται στον χάρτη — μπορείτε να τη μετακινήσετε.",
        });
      },
      (error) => {
        console.error("GPS error:", error);
        setGpsPermission(false);
        setIsLoadingGPS(false);

        toast({
          title: "Σφάλμα GPS",
          description:
            "Δεν ήταν δυνατή η λήψη της τοποθεσίας σας. Παρακαλώ επιλέξτε τοποθεσία στον χάρτη.",
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Λήψη τοποθεσίας GPS *</Label>
        <p className="text-sm text-gray-600">
          Απαιτείται η χρήση GPS ή η επιλογή τοποθεσίας στον χάρτη
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={handleGPSRequest}
          disabled={isLoadingGPS}
          className={`w-full ${!location ? "border-red-300 hover:border-red-400" : ""}`}
        >
          <MapPin className="mr-2 h-4 w-4" />
          {isLoadingGPS ? "Εντοπισμός τοποθεσίας..." : "Χρήση GPS για τοποθεσία"}
        </Button>
        {gpsPermission === false && (
          <p className="text-sm text-red-600">
            Η πρόσβαση στο GPS απορρίφθηκε. Παρακαλώ επιλέξτε την τοποθεσία στον χάρτη.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Τοποθεσία στον χάρτη *</Label>
        <ReportLocationMap
          location={location}
          onLocationSelect={(loc) => setLocation(loc)}
        />
        {location ? (
          <p className="text-sm text-green-600">
            ✓ Συντεταγμένες: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
          </p>
        ) : (
          <p className="text-sm text-red-500">
            * Κάντε κλικ στον χάρτη για να επιλέξετε τοποθεσία
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="report-address">Διεύθυνση τοποθεσίας *</Label>
        <AddressAutocomplete
          id="report-address"
          value={address}
          onChange={setAddress}
          onSelect={(res) => {
            setAddress(res.address);
            if (res.lat != null && res.lng != null) {
              setLocation({ lat: res.lat, lng: res.lng });
            }
          }}
          placeholder="Πληκτρολογήστε διεύθυνση στην Ξάνθη"
        />
        {!address && (
          <p className="text-sm text-red-500">* Απαιτείται η διεύθυνση τοποθεσίας</p>
        )}
      </div>
    </div>
  );
};

export default LocationForm;
