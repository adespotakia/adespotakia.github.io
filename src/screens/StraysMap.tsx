import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Map as MapIcon } from "lucide-react";

// Ξάνθη (Xanthi), Greece — fixed center.
const XANTHI_CENTER: [number, number] = [41.1413, 24.8882];

type Category = "new" | "registered" | "activities" | "lost" | "emergency";

const CATEGORY_CONFIG: Record<Category, { label: string; color: string }> = {
  new: { label: "Νέα αδέσποτα", color: "#2563eb" },
  registered: { label: "Δεσποζόμενα", color: "#16a34a" },
  activities: { label: "Δράσεις", color: "#f97316" },
  lost: { label: "Χαμένα", color: "#7c3aed" },
  emergency: { label: "Αναφορές επειγόντων", color: "#dc2626" },
};

interface MapPoint {
  id: string;
  title: string;
  category: Category;
  lat: number;
  lng: number;
  notes?: string | null;
  userId?: string | null;
}

const iconFor = (category: Category) =>
  L.divIcon({
    className: "",
    html: `<div style="width:30px;height:30px;border-radius:9999px;background:#fff;border:4px solid ${CATEGORY_CONFIG[category].color};box-shadow:0 2px 6px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;font-size:14px;">🐾</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

async function fetchPoints(): Promise<MapPoint[]> {
  const [reports, strays, activities, lost, neighborhood, profiles] = await Promise.all([
    supabase
      .from("reports")
      .select("id, animal_type, condition, description, location_lat, location_lng, user_id")
      .not("location_lat", "is", null)
      .not("location_lng", "is", null),
    supabase
      .from("strays")
      .select("id, name, story, location_description, latitude, longitude, registered_by")
      .not("latitude", "is", null)
      .not("longitude", "is", null),
    supabase
      .from("stray_activities")
      .select("id, activity_type, activity_description, location_lat, location_lng, user_id")
      .not("location_lat", "is", null)
      .not("location_lng", "is", null),
    supabase
      .from("lost_strays")
      .select("id, name, animal_type, locations, latitude, longitude, user_id")
      .not("latitude", "is", null)
      .not("longitude", "is", null),
    supabase
      .from("neighborhood_strays" as never)
      .select("id, name, animal_type, description, location_description, latitude, longitude, user_id")
      .not("latitude", "is", null)
      .not("longitude", "is", null),
    supabase.from("profiles").select("id, username"),
  ]);

  const points: MapPoint[] = [];

  ((reports.data ?? []) as any[]).forEach((r) =>
    points.push({
      id: `report-${r.id}`,
      title: r.animal_type ? `Επείγον (${r.animal_type})` : "Επείγον",
      category: "emergency",
      lat: r.location_lat,
      lng: r.location_lng,
      notes: r.description,
      userId: r.user_id,
    }),
  );
  ((neighborhood.data ?? []) as any[]).forEach((n) =>
    points.push({
      id: `neighborhood-${n.id}`,
      title: n.name || "Νέο αδέσποτο",
      category: "new",
      lat: n.latitude,
      lng: n.longitude,
      notes: n.description ?? n.location_description,
      userId: n.user_id,
    }),
  );

  ((strays.data ?? []) as any[]).forEach((s) =>
    points.push({
      id: `stray-${s.id}`,
      title: s.name ?? "Αδέσποτο",
      category: "registered",
      lat: s.latitude,
      lng: s.longitude,
      notes: s.story ?? s.location_description,
      userId: s.registered_by,
    }),
  );
  ((activities.data ?? []) as any[]).forEach((a) =>
    points.push({
      id: `activity-${a.id}`,
      title: a.activity_type ?? "Δράση",
      category: "activities",
      lat: a.location_lat,
      lng: a.location_lng,
      notes: a.activity_description,
      userId: a.user_id,
    }),
  );
  ((lost.data ?? []) as any[]).forEach((l) =>
    points.push({
      id: `lost-${l.id}`,
      title: l.name ?? "Χαμένο",
      category: "lost",
      lat: l.latitude,
      lng: l.longitude,
      notes: l.locations,
      userId: l.user_id,
    }),
  );

  const names = new Map<string, string>(
    ((profiles.data ?? []) as any[]).map((p) => [p.id, p.username ?? "Χρήστης"]),
  );
  return points.map((p) => ({
    ...p,
    notes: p.notes,
    userName: p.userId ? names.get(p.userId) ?? null : null,
  })) as MapPoint[];
}

const StraysMap = () => {
  const [category, setCategory] = useState<Category | "all">("all");
  const [userId, setUserId] = useState<string>("all");

  const { data: points = [], isLoading } = useQuery({
    queryKey: ["strays-map-points"],
    queryFn: fetchPoints,
  });

  const users = useMemo(() => {
    const map = new Map<string, string>();
    points.forEach((p: any) => {
      if (p.userId && p.userName) map.set(p.userId, p.userName);
    });
    return Array.from(map, ([id, name]) => ({ id, name })).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [points]);

  const filtered = useMemo(
    () =>
      points.filter(
        (p) =>
          (category === "all" || p.category === category) &&
          (userId === "all" || p.userId === userId),
      ),
    [points, category, userId],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-4 flex items-center gap-2">
        <MapIcon className="h-6 w-6 text-strays-orange" />
        <h1 className="text-2xl font-bold">Χάρτης Αδέσποτων</h1>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Δείτε όλες τις καταχωρήσεις στην Ξάνθη. Φιλτράρετε ανά κατηγορία ή ανά μέλος που τις
        πρόσθεσε.
      </p>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <Select value={category} onValueChange={(v) => setCategory(v as Category | "all")}>
          <SelectTrigger>
            <SelectValue placeholder="Κατηγορία" />
          </SelectTrigger>
          <SelectContent className="z-[2000] bg-white">
            <SelectItem value="all">Όλες οι καταχωρήσεις</SelectItem>
            <SelectItem value="new">Νέα αδέσποτα</SelectItem>
            <SelectItem value="registered">Δεσποζόμενα (Μητρώο)</SelectItem>
            <SelectItem value="activities">Δράσεις</SelectItem>
            <SelectItem value="emergency">Αναφορές επειγόντων</SelectItem>
            <SelectItem value="lost">Χαμένα</SelectItem>
          </SelectContent>
        </Select>

        <Select value={userId} onValueChange={setUserId}>
          <SelectTrigger>
            <SelectValue placeholder="Μέλος" />
          </SelectTrigger>
          <SelectContent className="z-[2000] max-h-72 bg-white">
            <SelectItem value="all">Όλα τα μέλη</SelectItem>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-3">
          <div className="h-[70vh] w-full overflow-hidden rounded-2xl border-4 border-strays-orange">
            <MapContainer center={XANTHI_CENTER} zoom={14} scrollWheelZoom className="h-full w-full">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filtered.map((p) => (
                <Marker key={p.id} position={[p.lat, p.lng]} icon={iconFor(p.category)}>
                  <Popup>
                    <p className="font-semibold">{p.title}</p>
                    <p className="text-xs">{CATEGORY_CONFIG[p.category].label}</p>
                    {p.notes && <p className="mt-1 text-xs">{p.notes}</p>}
                    {(p as any).userName && <p className="mt-1 text-xs">Από: {(p as any).userName}</p>}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {isLoading ? "Φόρτωση..." : `${filtered.length} σημεία στον χάρτη`}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StraysMap;
