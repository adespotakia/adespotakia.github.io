
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { sanitizeText } from "@/utils/inputSanitization";

interface StraySearchSectionProps {
  straySearch: string;
  setStraySearch: (value: string) => void;
  searchResults: any[] | undefined;
  selectedStray: any;
  setSelectedStray: (stray: any) => void;
}

const StraySearchSection = ({
  straySearch,
  setStraySearch,
  searchResults,
  selectedStray,
  setSelectedStray
}: StraySearchSectionProps) => {
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = sanitizeText(e.target.value);
    setStraySearch(sanitizedValue);
  };

  const clearSelection = () => {
    setSelectedStray(null);
    setStraySearch("");
  };

  return (
    <>
      <div className="space-y-2">
        <Label>Αναζήτηση Αδέσποτου *</Label>
        <Input
          placeholder="Πληκτρολογήστε όνομα αδέσποτου..."
          value={straySearch}
          onChange={handleSearchChange}
          maxLength={100}
          required
        />
        
        {!selectedStray && searchResults && searchResults.length > 0 && (
          <div className="border rounded-md max-h-40 overflow-y-auto">
            {searchResults.map((stray) => (
              <div
                key={stray.id}
                className="p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 flex items-center gap-3"
                onClick={() => {
                  setSelectedStray(stray);
                  setStraySearch(stray.name);
                }}
              >
                {(stray.image_url || stray.image_urls?.[0]) && (
                  <img
                    src={stray.image_url || stray.image_urls?.[0]}
                    alt={stray.name}
                    className="w-12 h-12 object-cover rounded-md"
                  />
                )}
                <div className="flex-1">
                  <div className="font-medium">{sanitizeText(stray.name)}</div>
                  <div className="text-sm text-gray-600">{sanitizeText(stray.location_description || '')}</div>
                  <div className="text-xs text-gray-500">
                    Καταγράφηκε από: {sanitizeText(stray.registerer_username || 'Άγνωστος')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedStray && (
        <div className="p-3 bg-green-50 rounded-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            {(selectedStray.image_url || selectedStray.image_urls?.[0]) && (
              <img
                src={selectedStray.image_url || selectedStray.image_urls?.[0]}
                alt={selectedStray.name}
                className="w-10 h-10 object-cover rounded-md"
              />
            )}
            <div>
              <div className="font-medium text-green-800">{sanitizeText(selectedStray.name)}</div>
              <div className="text-sm text-green-600">{sanitizeText(selectedStray.location_description || '')}</div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSelection}
            className="text-green-600 hover:text-green-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </>
  );
};

export default StraySearchSection;
