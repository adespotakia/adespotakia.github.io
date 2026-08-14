
import { useState, KeyboardEvent } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface LocationTagsInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
}

const LocationTagsInput = ({ tags, onTagsChange, placeholder = "Προσθέστε τοποθεσία..." }: LocationTagsInputProps) => {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const addTag = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !tags.includes(trimmedValue)) {
      onTagsChange([...tags, trimmedValue]);
      setInputValue("");
    }
  };

  const removeTag = (indexToRemove: number) => {
    onTagsChange(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleInputBlur = () => {
    if (inputValue.trim()) {
      addTag();
    }
  };

  return (
    <div className="space-y-2">
      <Label>Περιγραφή Τοποθεσίας</Label>
      <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-md bg-white min-h-[2.5rem] focus-within:ring-2 focus-within:ring-strays-orange focus-within:border-strays-orange">
        {tags.map((tag, index) => (
          <Badge 
            key={index} 
            variant="secondary" 
            className="bg-strays-orange/10 text-strays-orange border-strays-orange/20 hover:bg-strays-orange/20 flex items-center gap-1"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="ml-1 hover:bg-strays-orange/30 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleInputBlur}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="border-0 shadow-none p-0 h-6 flex-1 min-w-[120px] focus-visible:ring-0"
        />
      </div>
      <p className="text-xs text-gray-500">
        Πληκτρολογήστε μια τοποθεσία και πατήστε Enter ή κόμμα για να την προσθέσετε. π.χ. "Πάρκο Αλεξάνδρου", "Κέντρο πόλης", "Παραλία"
      </p>
    </div>
  );
};

export default LocationTagsInput;
