
import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";

interface GoogleMapPreviewProps {
  address: string;
}

const GoogleMapPreview = ({ address }: GoogleMapPreviewProps) => {
  const [mapUrl, setMapUrl] = useState<string>("");

  useEffect(() => {
    if (address && address.trim()) {
      // Create OpenStreetMap embed URL as fallback
      const encodedAddress = encodeURIComponent(address);
      // Using OpenStreetMap instead of Google Maps to avoid API key requirement
      const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=23.5,40.8,23.8,41.1&layer=mapnik&marker=41.0,23.7`;
      setMapUrl(osmUrl);
    }
  }, [address]);

  if (!address || !address.trim()) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <MapPin className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Προεπισκόπηση τοποθεσίας</span>
      </div>
      
      <div className="w-full h-48 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
        {mapUrl ? (
          <iframe
            src={mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            className="rounded-lg"
            title="Map preview"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center p-4">
              <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 font-medium">{address}</p>
              <p className="text-xs text-gray-500 mt-1">
                Προεπισκόπηση χάρτη
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleMapPreview;
