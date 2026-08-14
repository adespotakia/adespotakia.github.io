import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { loadGoogleMaps } from "@/lib/googleMapsLoader";

// Xanthi center bias
const XANTHI = { lat: 41.1413, lng: 24.888 };

interface Suggestion {
  text: string;
  placeId: string;
  lat?: number;
  lng?: number;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (result: { address: string; lat?: number; lng?: number }) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

const AddressAutocomplete = ({
  value,
  onChange,
  onSelect,
  placeholder = "Πληκτρολογήστε διεύθυνση στην Ξάνθη",
  className,
  id,
}: AddressAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const sessionTokenRef = useRef<any>(null);
  const placesLibRef = useRef<any>(null);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps()
      .then(async (g) => {
        const places = await g.maps.importLibrary("places");
        if (cancelled) return;
        placesLibRef.current = places;
        sessionTokenRef.current = new (places as any).AutocompleteSessionToken();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchFallback = async (input: string) => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=6&countrycodes=gr&accept-language=el&q=${encodeURIComponent(
        `${input}, Ξάνθη`
      )}`;
      const res = await fetch(url);
      const data = await res.json();
      const items: Suggestion[] = (data || []).map((d: any) => ({
        text: d.display_name as string,
        placeId: `osm-${d.place_id}`,
        lat: parseFloat(d.lat),
        lng: parseFloat(d.lon),
      }));
      setSuggestions(items);
      setOpen(items.length > 0);
    } catch {
      setSuggestions([]);
    }
  };

  const fetchSuggestions = (input: string) => {
    if (!input || input.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    if (!placesLibRef.current) {
      fetchFallback(input);
      return;
    }
    const { AutocompleteSuggestion } = placesLibRef.current;
    AutocompleteSuggestion.fetchAutocompleteSuggestions({
      input,
      sessionToken: sessionTokenRef.current,
      includedRegionCodes: ["gr"],
      locationBias: {
        center: XANTHI,
        radius: 15000,
      },
      language: "el",
    })
      .then((res: any) => {
        const items: Suggestion[] = (res.suggestions || [])
          .map((s: any) => {
            const p = s.placePrediction;
            if (!p) return null;
            return { text: p.text?.toString() || "", placeId: p.placeId };
          })
          .filter(Boolean)
          .slice(0, 6);
        if (items.length === 0) {
          fetchFallback(input);
          return;
        }
        setSuggestions(items);
        setOpen(items.length > 0);
      })
      .catch(() => fetchFallback(input));
  };

  const handleChange = (v: string) => {
    onChange(v);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => fetchSuggestions(v), 200);
  };

  const handlePick = async (s: Suggestion) => {
    onChange(s.text);
    setOpen(false);
    setSuggestions([]);
    if (!onSelect) return;
    if (s.placeId.startsWith("osm-")) {
      onSelect({ address: s.text, lat: s.lat, lng: s.lng });
      return;
    }
    // Optionally resolve coordinates
    if (placesLibRef.current) {
      try {
        const { Place } = placesLibRef.current;
        const place = new Place({ id: s.placeId });
        await place.fetchFields({ fields: ["location", "formattedAddress"] });
        onSelect({
          address: place.formattedAddress || s.text,
          lat: place.location?.lat(),
          lng: place.location?.lng(),
        });
        // New session after each selection
        sessionTokenRef.current = new placesLibRef.current.AutocompleteSessionToken();
      } catch {
        onSelect({ address: s.text });
      }
    }
  };

  return (
    <div className="relative">
      <Input
        id={id}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg max-h-64 overflow-auto">
          {suggestions.map((s) => (
            <li key={s.placeId}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handlePick(s)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
              >
                {s.text}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AddressAutocomplete;
