import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Ξάνθη (Xanthi), Greece — fixed default center.
const XANTHI_CENTER: { lat: number; lng: number } = { lat: 41.1413, lng: 24.8882 };

const pinIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width:40px;height:40px;border-radius:9999px;background:#fff;
      border:4px solid #dc2626;box-shadow:0 2px 6px rgba(0,0,0,0.35);
      display:flex;align-items:center;justify-content:center;font-size:18px;">📍</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const ClickHandler = ({ onChange }: { onChange: (p: { lat: number; lng: number }) => void }) => {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
};

const Recenter = ({ position }: { position: { lat: number; lng: number } | null }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView([position.lat, position.lng], map.getZoom());
  }, [position?.lat, position?.lng]);
  return null;
};

interface ReportLocationMapProps {
  location: { lat: number; lng: number } | null;
  onLocationSelect: (location: { lat: number; lng: number }) => void;
  heightClass?: string;
  borderClass?: string;
}

const ReportLocationMap = ({
  location,
  onLocationSelect,
  heightClass = "h-72",
  borderClass = "border-strays-orange",
}: ReportLocationMapProps) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className={`w-full ${heightClass} rounded-2xl border-4 ${borderClass} bg-gray-50`} />
    );
  }

  const center = location ?? XANTHI_CENTER;

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border-4 ${borderClass} shadow-md ${heightClass}`}
    >
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={15}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onChange={onLocationSelect} />
        <Recenter position={location} />
        {location && (
          <Marker
            position={[location.lat, location.lng]}
            icon={pinIcon}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const m = (e.target as L.Marker).getLatLng();
                onLocationSelect({ lat: m.lat, lng: m.lng });
              },
            }}
          />
        )}
      </MapContainer>
      <div className="pointer-events-none absolute bottom-2 left-2 right-2 z-[500] rounded bg-black/60 px-2 py-1 text-center text-xs text-white">
        Κάντε κλικ ή σύρετε την πινέζα για ακριβή τοποθεσία
      </div>
    </div>
  );
};

export default ReportLocationMap;
