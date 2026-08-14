import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ReportForm from "@/components/report/ReportForm";
import LostStrayReportForm from "@/components/lost/LostStrayReportForm";
import NeighborhoodStrayForm from "@/components/neighborhood/NeighborhoodStrayForm";
import StrayRegistrationForm from "@/components/stray/StrayRegistrationForm";
import ActivityFormSection from "@/components/stray/ActivityFormSection";
import { useStrayActivities } from "@/hooks/useStrayActivities";
import {
  Map as MapIcon,
  Eye,
  AlertTriangle,
  Utensils,
  Search,
  Trophy,
  Dog,
  Cat,
  Bird,
  ClipboardList,
  ArrowLeft,
  MapPin,
  HeartHandshake,
} from "lucide-react";

/**
 * Status + type model — mirrors the shape we read from Supabase.
 *  - Emergency markers come from the `reports` table (Επείγοντα form).
 *  - Care markers come from the `strays` table (Μητρώο Δεσποζομένων form).
 */
export type AnimalStatus = "emergency" | "lost" | "care" | "activity";
export type AnimalType = "dog" | "cat" | "bird" | "other";

export interface AnimalMarker {
  id: string;
  name: string;
  animalType: AnimalType;
  status: AnimalStatus;
  lat: number;
  lng: number;
  lastFed?: string | null;
  lastAntiparasitic?: string | null;
  notes?: string | null;
  ownerId?: string | null;
}

// Ξάνθη (Xanthi), Greece — fixed default center for all maps on this page.
const XANTHI_CENTER: [number, number] = [41.1413, 24.8882];
const GREECE_CENTER = XANTHI_CENTER;

const STATUS_CONFIG: Record<
  AnimalStatus,
  { label: string; ring: string; text: string; dot: string }
> = {
  emergency: { label: "Επείγον", ring: "#dc2626", text: "text-red-600", dot: "bg-red-600" },
  lost: { label: "Χαμένο", ring: "#ea580c", text: "text-orange-600", dot: "bg-orange-600" },
  care: { label: "Φροντίδα", ring: "#16a34a", text: "text-green-600", dot: "bg-green-600" },
  activity: { label: "Δραστηριότητα", ring: "#f97316", text: "text-orange-500", dot: "bg-orange-500" },
};

const TYPE_EMOJI: Record<AnimalType, string> = {
  dog: "🐕",
  cat: "🐈",
  bird: "🐦",
  other: "🐾",
};

function normalizeType(value?: string | null): AnimalType {
  if (value === "dog" || value === "cat" || value === "bird") return value;
  return "other";
}

const CONDITION_LABELS: Record<string, string> = {
  injured: "Τραυματισμένο",
  sick: "Άρρωστο",
  healthy: "Υγιές",
  hungry: "Πεινασμένο",
  lost: "Χαμένο",
};

// Emergency reports (with GPS) → red markers.
async function fetchReportMarkers(): Promise<AnimalMarker[]> {
  const { data } = await supabase
    .from("reports")
    .select("id, animal_type, condition, description, location_lat, location_lng, created_at")
    .not("location_lat", "is", null)
    .not("location_lng", "is", null);

  return ((data ?? []) as any[]).map((r) => ({
    id: `report-${r.id}`,
    name: CONDITION_LABELS[r.condition] ?? "Αναφορά",
    animalType: normalizeType(r.animal_type),
    status: "emergency" as const,
    lat: r.location_lat,
    lng: r.location_lng,
    notes: r.description ?? null,
  }));
}

// Registered strays (Μητρώο Δεσποζομένων) with a saved location → green markers.
async function fetchStrayMarkers(): Promise<AnimalMarker[]> {
  const { data } = await supabase
    .from("strays")
    .select("id, name, animal_type, story, location_description, latitude, longitude, registered_by, created_at")
    .not("latitude", "is", null)
    .not("longitude", "is", null);

  return ((data ?? []) as any[]).map((s) => ({
    id: `stray-${s.id}`,
    name: s.name ?? "Αδέσποτο",
    animalType: normalizeType(s.animal_type),
    status: "care" as const,
    lat: s.latitude,
    lng: s.longitude,
    notes: s.story ?? s.location_description ?? null,
    ownerId: s.registered_by ?? null,
  }));
}

// Stray care activities (Δίκτυο) with a saved location → purple markers.
async function fetchActivityMarkers(): Promise<AnimalMarker[]> {
  const { data } = await supabase
    .from("stray_activities")
    .select("id, activity_type, activity_description, location_lat, location_lng, user_id, strays(name, animal_type)")
    .not("location_lat", "is", null)
    .not("location_lng", "is", null);

  return ((data ?? []) as any[]).map((a) => ({
    id: `activity-${a.id}`,
    name: a.strays?.name ?? a.activity_type ?? "Δραστηριότητα",
    animalType: normalizeType(a.strays?.animal_type),
    status: "activity" as const,
    lat: a.location_lat,
    lng: a.location_lng,
    notes: a.activity_description ?? null,
    ownerId: a.user_id ?? null,
  }));
}

function createMarkerIcon(marker: AnimalMarker) {
  const cfg = STATUS_CONFIG[marker.status];
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:40px;height:40px;border-radius:9999px;background:#fff;
        border:4px solid ${cfg.ring};box-shadow:0 2px 6px rgba(0,0,0,0.3);
        display:flex;align-items:center;justify-content:center;font-size:18px;">
        ${TYPE_EMOJI[marker.animalType]}
      </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -22],
  });
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("el-GR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const TYPE_FILTERS: { type: AnimalType; label: string; Icon: typeof Dog }[] = [
  { type: "dog", label: "Σκύλος", Icon: Dog },
  { type: "cat", label: "Γάτα", Icon: Cat },
  { type: "bird", label: "Πουλί", Icon: Bird },
];

const BOTTOM_NAV = [
  { key: "map", label: "Χάρτης", Icon: MapIcon },
  { key: "saw", label: "Το είδα!", Icon: Eye },
  { key: "emergency", label: "Επείγον", Icon: AlertTriangle },
  { key: "feeding", label: "Σίτιση", Icon: Utensils },
  { key: "lost", label: "Χαμένα", Icon: Search },
  { key: "points", label: "Πόντοι", Icon: Trophy },
];

interface MarkerMapProps {
  markers: AnimalMarker[];
  activeTypes: AnimalType[];
  onToggleType?: (type: AnimalType) => void;
  showFilters?: boolean;
  showBottomNav?: boolean;
  heightClass?: string;
  borderClass?: string;
  currentUserId?: string | null;
  /** When set, renders a draggable pin to fine-tune a location before saving. */
  picker?: {
    position: { lat: number; lng: number };
    onChange: (pos: { lat: number; lng: number }) => void;
  };
}

/** Draggable + click-to-place pin used to fine-tune a stray's location. */
const LocationPicker = ({
  position,
  onChange,
}: {
  position: { lat: number; lng: number };
  onChange: (pos: { lat: number; lng: number }) => void;
}) => {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  const icon = L.divIcon({
    className: "",
    html: `
      <div style="
        width:40px;height:40px;border-radius:9999px;background:#fff;
        border:4px solid #2563eb;box-shadow:0 2px 6px rgba(0,0,0,0.35);
        display:flex;align-items:center;justify-content:center;font-size:18px;">📍</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
  return (
    <Marker
      position={[position.lat, position.lng]}
      icon={icon}
      draggable
      eventHandlers={{
        dragend: (e) => {
          const m = (e.target as L.Marker).getLatLng();
          onChange({ lat: m.lat, lng: m.lng });
        },
      }}
    />
  );
};

/** Reusable Leaflet map that renders a given set of markers. */
const MarkerMap = ({
  markers,
  activeTypes,
  onToggleType,
  showFilters = true,
  showBottomNav = false,
  heightClass = "h-[70vh]",
  borderClass = "border-strays-orange",
  currentUserId = null,
  picker,
}: MarkerMapProps) => {
  const [activeNav, setActiveNav] = useState("map");

  const visibleMarkers = useMemo(
    () =>
      activeTypes.length === 0
        ? markers
        : markers.filter((m) => activeTypes.includes(m.animalType)),
    [markers, activeTypes],
  );

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border-4 ${borderClass} shadow-md ${heightClass}`}
    >
      {showFilters && onToggleType && (
        <div className="absolute top-0 left-0 right-0 z-[1000] p-3">
          <div className="mx-auto flex max-w-md items-center justify-center gap-2 rounded-full bg-white/95 p-2 shadow-lg backdrop-blur">
            {TYPE_FILTERS.map(({ type, label, Icon }) => {
              const active = activeTypes.includes(type);
              return (
                <button
                  key={type}
                  onClick={() => onToggleType(type)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-strays-orange text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <MapContainer
        center={picker ? [picker.position.lat, picker.position.lng] : GREECE_CENTER}
        zoom={14}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {picker && (
          <LocationPicker position={picker.position} onChange={picker.onChange} />
        )}
        {visibleMarkers.map((marker) => {
          const cfg = STATUS_CONFIG[marker.status];
          const isMine = !!currentUserId && marker.ownerId === currentUserId;
          return (
            <Marker
              key={marker.id}
              position={[marker.lat, marker.lng]}
              icon={createMarkerIcon(marker)}
            >
              <Popup>
                <div className="min-w-[200px] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-gray-900">
                      {TYPE_EMOJI[marker.animalType]} {marker.name}
                    </span>
                    <span
                      className={`flex items-center gap-1 text-xs font-semibold ${cfg.text}`}
                    >
                      <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                  </div>
                  {isMine && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                      ✓ Καταχωρήθηκε από τον λογαριασμό σας
                    </span>
                  )}
                  {marker.notes && (
                    <p className="text-xs text-gray-600">{marker.notes}</p>
                  )}
                  <div className="rounded-md bg-gray-50 p-2 text-xs text-gray-700">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Τελευταία σίτιση:</span>
                      <span className="font-medium">{formatDate(marker.lastFed)}</span>
                    </div>
                    <div className="mt-1 flex justify-between">
                      <span className="text-gray-500">Αντιπαρασιτικό:</span>
                      <span className="font-medium">
                        {formatDate(marker.lastAntiparasitic)}
                      </span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>


      {showBottomNav && (
        <div className="absolute bottom-0 left-0 right-0 z-[1000] p-3">
          <div className="mx-auto flex max-w-lg items-center justify-around rounded-2xl bg-white/95 px-2 py-2 shadow-lg backdrop-blur">
            {BOTTOM_NAV.map(({ key, label, Icon }) => {
              const active = activeNav === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveNav(key)}
                  className={`flex flex-col items-center gap-1 rounded-xl px-2 py-1 text-[11px] font-medium transition-colors ${
                    active ? "text-strays-orange" : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const AdespolisMap = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user } = useAuth();

  const { data: reportMarkers = [] } = useQuery({
    queryKey: ["map-markers", "reports"],
    queryFn: fetchReportMarkers,
  });
  const { data: strayMarkers = [] } = useQuery({
    queryKey: ["map-markers", "strays"],
    queryFn: fetchStrayMarkers,
  });
  const { data: activityMarkers = [] } = useQuery({
    queryKey: ["map-markers", "activities"],
    queryFn: fetchActivityMarkers,
  });

  const [activeForm, setActiveForm] = useState<
    "report" | "registration" | "activity" | "neighborhood" | "lost" | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pickedLocation, setPickedLocation] = useState<{ lat: number; lng: number }>({
    lat: GREECE_CENTER[0],
    lng: GREECE_CENTER[1],
  });
  const [addedNotice, setAddedNotice] = useState(false);

  // Δραστηριότητες form state (hook is self-contained; we sync the picker into it).
  const activityCtx = useStrayActivities();

  // When the picker moves, mirror the coordinates into the activity form.
  useEffect(() => {
    if (activeForm !== "activity") return;
    activityCtx.setCoordinates({
      lat: pickedLocation.lat.toString(),
      lng: pickedLocation.lng.toString(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickedLocation, activeForm]);

  const refreshReports = () => {
    queryClient.invalidateQueries({ queryKey: ["map-markers", "reports"] });
  };
  const refreshStrays = () => {
    queryClient.invalidateQueries({ queryKey: ["map-markers", "strays"] });
    setActiveForm(null);
    setAddedNotice(true);
  };

  const toggleForm = (
    form: "report" | "registration" | "activity" | "neighborhood" | "lost",
  ) => {
    setAddedNotice(false);
    setActiveForm((prev) => (prev === form ? null : form));
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-4">
      {/* Back button + guidance notice */}
      <div className="mb-4">
        <button
          onClick={() => router.history.back()}
          className="mb-3 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Πίσω
        </button>
        <div className="rounded-xl border border-strays-orange/40 bg-orange-50 p-4 text-sm text-gray-700">
          Επιλέξτε <span className="font-semibold text-green-700">Μητρώο Δεσποζομένων</span> για
          ένα αδέσποτο που φροντίζετε, <span className="font-semibold text-red-600">Επείγοντα</span> αν
          υπάρχει κατάσταση που χρειάζεται να αναλάβει ο Δήμος, ή{" "}
          <span className="font-semibold text-orange-500">Δραστηριότητες</span> για να καταγραφεί
          κάποια δραστηριότητα φροντίδας.
        </div>
      </div>

      {addedNotice && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-green-300 bg-green-50 p-3 text-sm font-medium text-green-700">
          ✓ Το αδέσποτο προστέθηκε στον χάρτη από τον λογαριασμό σας.
        </div>
      )}

      {/* Action buttons — Νέα (blue), Μητρώο (green), Δραστηριότητες (orange), Επείγοντα (red), Χαμένα (purple) */}
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-3 pb-4 sm:grid-cols-3 lg:grid-cols-5">
        <button
          onClick={() => toggleForm("neighborhood")}
          className={`flex items-center justify-center gap-2 rounded-xl border border-blue-600 px-4 py-3 text-sm font-semibold shadow-sm transition-colors ${
            activeForm === "neighborhood"
              ? "bg-blue-600 text-white"
              : "text-blue-700 hover:bg-blue-50"
          }`}
        >
          <MapPin className="h-5 w-5" />
          Νέα Αδέσποτα
        </button>
        <button
          onClick={() => toggleForm("registration")}
          className={`flex items-center justify-center gap-2 rounded-xl border border-green-600 px-4 py-3 text-sm font-semibold shadow-sm transition-colors ${
            activeForm === "registration"
              ? "bg-green-600 text-white"
              : "text-green-700 hover:bg-green-50"
          }`}
        >
          <ClipboardList className="h-5 w-5" />
          Μητρώο Δεσποζομένων
        </button>
        <button
          onClick={() => toggleForm("activity")}
          className={`flex items-center justify-center gap-2 rounded-xl border border-orange-500 px-4 py-3 text-sm font-semibold shadow-sm transition-colors ${
            activeForm === "activity"
              ? "bg-orange-500 text-white"
              : "text-orange-600 hover:bg-orange-50"
          }`}
        >
          <HeartHandshake className="h-5 w-5" />
          Δραστηριότητες
        </button>
        <button
          onClick={() => toggleForm("report")}
          className={`flex items-center justify-center gap-2 rounded-xl border border-red-600 px-4 py-3 text-sm font-semibold shadow-sm transition-colors ${
            activeForm === "report"
              ? "bg-red-600 text-white"
              : "text-red-600 hover:bg-red-50"
          }`}
        >
          <AlertTriangle className="h-5 w-5" />
          Επείγοντα
        </button>
        <button
          onClick={() => toggleForm("lost")}
          className={`flex items-center justify-center gap-2 rounded-xl border border-purple-600 px-4 py-3 text-sm font-semibold shadow-sm transition-colors ${
            activeForm === "lost"
              ? "bg-purple-600 text-white"
              : "text-purple-700 hover:bg-purple-50"
          }`}
        >
          <Search className="h-5 w-5" />
          Χαμένα
        </button>
      </div>

      {/* Νέο αδέσποτο — φόρμα με ενσωματωμένο χάρτη/GPS */}
      {activeForm === "neighborhood" && (
        <div className="space-y-4">
          <NeighborhoodStrayForm
            location={pickedLocation}
            onLocationChange={(loc) => loc && setPickedLocation(loc)}
            onSuccess={() => {
              setActiveForm(null);
              setAddedNotice(true);
            }}
          />
        </div>
      )}


      {/* Χαμένα — picker map + form */}
      {activeForm === "lost" && (
        <div className="space-y-4">
          <div>
            <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-purple-700">
              <Search className="h-5 w-5" /> Χάρτης Χαμένων
            </h2>
            <p className="mb-2 text-sm text-gray-600">
              Σύρετε την πινέζα ή κάντε κλικ στον χάρτη για να ορίσετε το σημείο που χάθηκε.
            </p>
            <MarkerMap
              markers={[]}
              activeTypes={[]}
              showFilters={false}
              heightClass="h-[45vh]"
              borderClass="border-purple-600"
              currentUserId={user?.id ?? null}
              picker={{ position: pickedLocation, onChange: setPickedLocation }}
            />
          </div>
          <LostStrayReportForm
            location={pickedLocation}
            onSuccess={() => {
              setActiveForm(null);
              setAddedNotice(true);
            }}
          />
        </div>
      )}



      {/* Μητρώο Δεσποζομένων — its own map (registered strays) + form */}
      {activeForm === "registration" && (
        <div className="space-y-4">
          <div>
            <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-green-700">
              <ClipboardList className="h-5 w-5" /> Χάρτης Μητρώου Δεσποζομένων
            </h2>
            <p className="mb-2 flex items-center gap-1.5 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-blue-600" />
              Σύρετε την μπλε πινέζα ή κάντε κλικ στον χάρτη για να ρυθμίσετε την ακριβή τοποθεσία
              πριν την αποθήκευση.
            </p>
            <MarkerMap
              markers={strayMarkers}
              activeTypes={[]}
              showFilters={false}
              heightClass="h-[45vh]"
              borderClass="border-green-600"
              currentUserId={user?.id ?? null}
              picker={{ position: pickedLocation, onChange: setPickedLocation }}
            />
            <p className="mt-1 text-xs text-gray-500">
              Επιλεγμένη τοποθεσία: {pickedLocation.lat.toFixed(5)}, {pickedLocation.lng.toFixed(5)}
            </p>
          </div>
          <StrayRegistrationForm
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
            onSuccess={refreshStrays}
            location={pickedLocation}
          />
        </div>
      )}

      {/* Επείγοντα — φόρμα (χωρίς επάνω χάρτη) */}
      {activeForm === "report" && (
        <div className="space-y-4">
          <ReportForm onSuccess={refreshReports} />
        </div>
      )}

      {/* Δραστηριότητες — its own map (activities) + form with picker */}
      {activeForm === "activity" && (
        <div className="space-y-4">
          <div>
            <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-orange-600">
              <HeartHandshake className="h-5 w-5" /> Χάρτης Δραστηριοτήτων Μελών
            </h2>
            <p className="mb-2 flex items-center gap-1.5 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-blue-600" />
              Σύρετε την μπλε πινέζα ή κάντε κλικ στον χάρτη για να ρυθμίσετε την ακριβή τοποθεσία
              της δραστηριότητας πριν την καταγραφή.
            </p>
            <MarkerMap
              markers={activityMarkers}
              activeTypes={[]}
              showFilters={false}
              heightClass="h-[45vh]"
              borderClass="border-orange-500"
              currentUserId={user?.id ?? null}
              picker={{ position: pickedLocation, onChange: setPickedLocation }}
            />
            <p className="mt-1 text-xs text-gray-500">
              Επιλεγμένη τοποθεσία: {pickedLocation.lat.toFixed(5)}, {pickedLocation.lng.toFixed(5)}
            </p>
          </div>
          <ActivityFormSection
            formData={activityCtx.formData}
            setFormData={activityCtx.setFormData}
            straySearch={activityCtx.straySearch}
            setStraySearch={activityCtx.setStraySearch}
            selectedStray={activityCtx.selectedStray}
            setSelectedStray={activityCtx.setSelectedStray}
            activityImages={activityCtx.activityImages}
            setActivityImages={activityCtx.setActivityImages}
            coordinates={activityCtx.coordinates}
            setCoordinates={activityCtx.setCoordinates}
            searchResults={activityCtx.searchResults}
            onSubmit={(e) => {
              activityCtx.handleSubmit(e);
              queryClient.invalidateQueries({ queryKey: ["map-markers", "activities"] });
            }}
            isSubmitting={activityCtx.isSubmitting}
          />
        </div>
      )}
    </div>

  );
};

export default AdespolisMap;
