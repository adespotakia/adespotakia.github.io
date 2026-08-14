import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AddressAutocomplete from "@/components/common/AddressAutocomplete";
import { X, MapPin } from "lucide-react";
import ImageCropDialog from "@/components/common/ImageCropDialog";
import ReportLocationMap from "@/components/report/ReportLocationMap";

interface NeighborhoodStrayFormProps {
  location?: { lat: number; lng: number } | null;
  onLocationChange?: (loc: { lat: number; lng: number } | null) => void;
  onSuccess?: () => void;
}

const MAX_PHOTOS = 5;

const NeighborhoodStrayForm = ({ location = null, onLocationChange, onSuccess }: NeighborhoodStrayFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [registererName, setRegistererName] = useState("");
  const [name, setName] = useState("");
  const [animalType, setAnimalType] = useState("dog");
  const [locationDescription, setLocationDescription] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cropQueue, setCropQueue] = useState<File[]>([]);
  const [point, setPoint] = useState<{ lat: number; lng: number } | null>(location);
  const [gpsConfirmed, setGpsConfirmed] = useState(false);
  const [loadingGps, setLoadingGps] = useState(false);

  useEffect(() => {
    if (location) setPoint(location);
  }, [location?.lat, location?.lng]);

  const updatePoint = (loc: { lat: number; lng: number } | null) => {
    setPoint(loc);
    onLocationChange?.(loc);
  };

  const requestGps = () => {
    if (!navigator.geolocation) {
      toast({ title: "Η γεωτοποθεσία δεν υποστηρίζεται", variant: "destructive" });
      return;
    }
    setLoadingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updatePoint({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsConfirmed(true);
        setLoadingGps(false);
        toast({
          title: "Η τοποθεσία εντοπίστηκε",
          description: "Η πινέζα τοποθετήθηκε στο σημείο σας — μπορείτε να τη μετακινήσετε.",
        });
      },
      () => {
        setLoadingGps(false);
        toast({
          title: "Σφάλμα GPS",
          description: "Δεν ήταν δυνατή η λήψη της τοποθεσίας. Επιτρέψτε την πρόσβαση στο GPS.",
          variant: "destructive",
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  const cropFile = cropQueue[0] ?? null;

  const handleCropped = (file: File) => {
    setPhotos((prev) => [...prev, file].slice(0, MAX_PHOTOS));
    setCropQueue((prev) => prev.slice(1));
  };

  const skipCrop = () => {
    setCropQueue((prev) => {
      const [current, ...rest] = prev;
      if (current) setPhotos((p) => [...p, current].slice(0, MAX_PHOTOS));
      return rest;
    });
  };

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from("profiles")
      .select("username, first_name, last_name")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        const p = data as any;
        if (!p) return;
        const full = [p.first_name, p.last_name].filter(Boolean).join(" ");
        setRegistererName(full || p.username || "");
      });
  }, [user?.id]);

  useEffect(() => {
    const urls = photos.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [photos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast({ title: "Πρέπει να είστε συνδεδεμένοι", variant: "destructive" });
      return;
    }
    if (!gpsConfirmed || !point) {
      toast({
        title: "Απαιτείται λήψη GPS",
        description: "Πατήστε «Λήψη GPS» για να καταγραφεί το σημείο σας στον χάρτη.",
        variant: "destructive",
      });
      return;
    }
    if (photos.length === 0) {
      toast({ title: "Απαιτείται τουλάχιστον 1 φωτογραφία", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const imageUrls: string[] = [];
      for (const photo of photos.slice(0, MAX_PHOTOS)) {
        const path = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${
          photo.name.split(".").pop() || "jpg"
        }`;
        const { error: upErr } = await supabase.storage.from("strays").upload(path, photo);
        if (upErr) throw upErr;
        imageUrls.push(supabase.storage.from("strays").getPublicUrl(path).data.publicUrl);
      }

      const { error } = await supabase.from("neighborhood_strays" as never).insert([
        {
          user_id: user.id,
          registerer_name: registererName || "Μέλος",
          name: name.trim() || null,
          animal_type: animalType,
          description: description.trim() || null,
          location_description: locationDescription.trim() || null,
          image_urls: imageUrls.length ? imageUrls : null,
          latitude: point?.lat ?? null,
          longitude: point?.lng ?? null,
        },
      ] as never);
      if (error) throw error;

      toast({ title: "Καταχωρήθηκε", description: "Το νέο αδέσποτο προστέθηκε στον χάρτη." });
      setName("");
      setDescription("");
      setLocationDescription("");
      setPhotos([]);
      setGpsConfirmed(false);
      onSuccess?.();
    } catch (err) {
      toast({
        title: "Σφάλμα καταχώρησης",
        description: err instanceof Error ? err.message : "Δοκιμάστε ξανά.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-blue-300 bg-white p-4">
      <h3 className="text-lg font-semibold text-blue-700">Νέο αδέσποτο</h3>

      <div>
        <Label>Καταχωρητής</Label>
        <Input value={registererName} readOnly className="bg-gray-100" />
      </div>

      <div>
        <Label htmlFor="nb-name">Όνομα / χαρακτηρισμός (προαιρετικό)</Label>
        <Input id="nb-name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div>
        <Label>Είδος</Label>
        <div className="mt-1 flex gap-2">
          {[
            { v: "dog", l: "Σκύλος" },
            { v: "cat", l: "Γάτα" },
            { v: "other", l: "Άλλο" },
          ].map((o) => (
            <button
              key={o.v}
              type="button"
              onClick={() => setAnimalType(o.v)}
              className={`rounded-lg border px-3 py-1.5 text-sm ${
                animalType === o.v ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300"
              }`}
            >
              {o.l}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Τοποθεσία αδέσποτου</Label>
        <AddressAutocomplete
          value={locationDescription}
          onChange={setLocationDescription}
          placeholder="Πληκτρολογήστε διεύθυνση στην Ξάνθη"
        />
      </div>

      <div className="space-y-2">
        <Label>Σημείο στον χάρτη *</Label>
        <Button
          type="button"
          variant="outline"
          onClick={requestGps}
          disabled={loadingGps}
          className={`w-full ${!gpsConfirmed ? "border-red-300 hover:border-red-400" : ""}`}
        >
          <MapPin className="mr-2 h-4 w-4" />
          {loadingGps ? "Εντοπισμός τοποθεσίας..." : "Λήψη GPS"}
        </Button>
        <ReportLocationMap
          location={point}
          onLocationSelect={updatePoint}
          borderClass="border-blue-600"
        />
        {gpsConfirmed && point ? (
          <p className="text-sm text-green-600">
            ✓ Συντεταγμένες: {point.lat.toFixed(6)}, {point.lng.toFixed(6)}
          </p>
        ) : (
          <p className="text-sm text-red-500">
            * Απαιτείται λήψη GPS από το κινητό σας για να σημειωθεί η πινέζα
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="nb-photos">Φωτογραφίες * (έως {MAX_PHOTOS})</Label>
        <Input
          id="nb-photos"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            setCropQueue((prev) => [...prev, ...files]);
            e.target.value = "";
          }}
          disabled={photos.length >= MAX_PHOTOS}
        />
        {previews.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {previews.map((src, i) => (
              <div key={src} className="relative">
                <img src={src} alt={`Φωτογραφία ${i + 1}`} className="h-20 w-20 rounded-md object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute -right-1 -top-1 rounded-full bg-red-600 p-0.5 text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <p className={`mt-1 text-xs ${photos.length === 0 ? "text-red-500" : "text-gray-500"}`}>
          {photos.length} από {MAX_PHOTOS} εικόνες επιλεγμένες
          {photos.length === 0 && " - Απαιτείται τουλάχιστον 1"}
        </p>
      </div>

      <ImageCropDialog
        file={cropFile}
        open={!!cropFile}
        onCancel={skipCrop}
        onCropped={handleCropped}
      />

      <div>
        <Label htmlFor="nb-desc">Περιγραφή</Label>
        <Textarea
          id="nb-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Πότε το είδατε, πώς είναι, αν είναι φιλικό..."
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700">
        {isSubmitting ? "Καταχώρηση..." : "Καταχώρηση νέου αδέσποτου"}
      </Button>
    </form>
  );
};

export default NeighborhoodStrayForm;
