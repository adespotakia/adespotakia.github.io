
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface StrayCharacteristicsProps {
  value: string[];
  onChange: (characteristics: string[]) => void;
}

const CHARACTERISTICS_OPTIONS = [
  "Φιλικό",
  "Φοβισμένο", 
  "Χαδιάρικο",
  "Τα πάει καλά με σκύλους",
  "Ανθρωποκεντρικό",
  "Δεν μπορώ να προσδιορίσω"
];

const StrayCharacteristics = ({ value, onChange }: StrayCharacteristicsProps) => {
  const handleChange = (characteristic: string, checked: boolean) => {
    if (checked) {
      onChange([...value, characteristic]);
    } else {
      onChange(value.filter(item => item !== characteristic));
    }
  };

  return (
    <div className="space-y-3">
      <Label>Χαρακτηριστικά</Label>
      <div className="grid grid-cols-1 gap-3">
        {CHARACTERISTICS_OPTIONS.map((characteristic) => (
          <div key={characteristic} className="flex items-center space-x-2">
            <Checkbox
              id={characteristic}
              checked={value.includes(characteristic)}
              onCheckedChange={(checked) => handleChange(characteristic, !!checked)}
            />
            <Label htmlFor={characteristic}>{characteristic}</Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StrayCharacteristics;
