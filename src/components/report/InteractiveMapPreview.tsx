
import { useEffect, useRef, useState } from "react";

interface InteractiveMapPreviewProps {
  location: { lat: number; lng: number } | null;
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
}

const InteractiveMapPreview = ({ location, onLocationSelect }: InteractiveMapPreviewProps) => {
  const [selectedLocation, setSelectedLocation] = useState(location);
  
  // Xanthi, Greece coordinates
  const xanthiCenter = { lat: 41.1354, lng: 24.8882 };
  
  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!onLocationSelect) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convert click position to coordinates around Xanthi
    // More accurate conversion for Xanthi area
    const lat = xanthiCenter.lat + (rect.height / 2 - y) * 0.0008;
    const lng = xanthiCenter.lng + (x - rect.width / 2) * 0.0012;
    
    const newLocation = { lat, lng };
    setSelectedLocation(newLocation);
    onLocationSelect(newLocation);
  };

  useEffect(() => {
    setSelectedLocation(location);
  }, [location]);

  // Calculate marker position based on coordinates
  const getMarkerPosition = (loc: { lat: number; lng: number }) => {
    const x = 50 + (loc.lng - xanthiCenter.lng) * 833.33; // Adjusted scale
    const y = 50 - (loc.lat - xanthiCenter.lat) * 1250; // Adjusted scale
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
  };

  return (
    <div className="w-full h-64 border border-gray-300 rounded-lg overflow-hidden">
      <div 
        className="w-full h-full relative cursor-pointer bg-green-50"
        onClick={handleMapClick}
      >
        {/* OpenStreetMap-style background */}
        <svg className="w-full h-full" viewBox="0 0 400 300">
          {/* Base map background */}
          <rect width="400" height="300" fill="#f2f8f2"/>
          
          {/* Major roads and streets (OpenStreetMap style) */}
          <g stroke="#ffffff" strokeWidth="3" fill="none">
            {/* Main highways */}
            <path d="M 0 120 Q 100 115 200 120 T 400 125" stroke="#ffc345" strokeWidth="4"/>
            <path d="M 180 0 Q 185 75 190 150 T 200 300" stroke="#ffc345" strokeWidth="4"/>
            
            {/* Secondary roads */}
            <path d="M 0 80 L 400 85" stroke="#ffffff" strokeWidth="2"/>
            <path d="M 0 160 L 400 165" stroke="#ffffff" strokeWidth="2"/>
            <path d="M 0 200 L 400 205" stroke="#ffffff" strokeWidth="2"/>
            <path d="M 50 0 L 55 300" stroke="#ffffff" strokeWidth="2"/>
            <path d="M 120 0 L 125 300" stroke="#ffffff" strokeWidth="2"/>
            <path d="M 280 0 L 285 300" stroke="#ffffff" strokeWidth="2"/>
            <path d="M 350 0 L 355 300" stroke="#ffffff" strokeWidth="2"/>
          </g>
          
          {/* Buildings and areas */}
          <g fill="#e6e6e6" stroke="#cccccc" strokeWidth="0.5">
            <rect x="60" y="90" width="30" height="20" />
            <rect x="140" y="70" width="25" height="30" />
            <rect x="220" y="95" width="40" height="25" />
            <rect x="300" y="85" width="35" height="20" />
            <rect x="80" y="180" width="45" height="30" />
            <rect x="250" y="170" width="30" height="25" />
          </g>
          
          {/* Green spaces (parks) */}
          <g fill="#b3d9b3">
            <circle cx="150" cy="200" r="25" />
            <ellipse cx="320" cy="140" rx="20" ry="15" />
            <rect x="30" y="220" width="40" height="30" rx="5" />
          </g>
          
          {/* Water bodies */}
          <g fill="#b3d9ff" stroke="#99ccff" strokeWidth="1">
            <path d="M 0 250 Q 50 245 100 250 T 200 255 Q 250 260 300 255 T 400 250 L 400 300 L 0 300 Z" />
          </g>
          
          {/* Landmarks with labels */}
          <g>
            {/* City Center */}
            <circle cx="200" cy="120" r="6" fill="#dc2626" />
            <text x="210" y="125" fontSize="8" fill="#dc2626" fontWeight="bold">Κέντρο Ξάνθης</text>
            
            {/* University */}
            <rect x="295" y="135" width="8" height="8" fill="#2563eb" />
            <text x="305" y="142" fontSize="7" fill="#2563eb">Πανεπιστήμιο</text>
            
            {/* Hospital */}
            <circle cx="80" cy="180" r="4" fill="#dc2626" />
            <text x="88" y="184" fontSize="7" fill="#dc2626">Νοσοκομείο</text>
            
            {/* Park */}
            <circle cx="150" cy="200" r="3" fill="#059669" />
            <text x="158" y="204" fontSize="7" fill="#059669">Πάρκο</text>
          </g>
          
          {/* Grid lines for easier coordinate estimation */}
          <g stroke="#000000" strokeWidth="0.2" opacity="0.1">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </g>
        </svg>
        
        {/* Selected location marker */}
        {selectedLocation && (
          <div 
            className="absolute w-6 h-6 bg-red-500 rounded-full transform -translate-x-3 -translate-y-6 border-2 border-white shadow-lg z-10"
            style={{
              left: `${getMarkerPosition(selectedLocation).x}%`,
              top: `${getMarkerPosition(selectedLocation).y}%`
            }}
          >
            {/* Marker pin */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-2 bg-red-500"></div>
          </div>
        )}
        
        {/* Info overlay */}
        <div className="absolute top-2 left-2 bg-white/95 p-2 rounded shadow text-xs backdrop-blur-sm">
          <div className="font-semibold text-gray-800">Ξάνθη, Ελλάδα</div>
          {selectedLocation && (
            <div className="mt-1 text-gray-600">
              Lat: {selectedLocation.lat.toFixed(6)}<br/>
              Lng: {selectedLocation.lng.toFixed(6)}
            </div>
          )}
        </div>
        
        {/* Instructions */}
        <div className="absolute bottom-2 left-2 right-2 bg-blue-600/90 text-white p-2 rounded text-xs text-center backdrop-blur-sm">
          Κάντε κλικ στον χάρτη για να επιλέξετε την τοποθεσία
        </div>
      </div>
    </div>
  );
};

export default InteractiveMapPreview;
