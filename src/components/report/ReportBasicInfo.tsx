
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ReportBasicInfoProps {
  animalType: string;
  setAnimalType: (value: string) => void;
  condition: string;
  setCondition: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  cannotIdentify?: boolean;
  setCannotIdentify?: (value: boolean) => void;
}

const ReportBasicInfo = ({
  animalType,
  setAnimalType,
  condition,
  setCondition,
  description,
  setDescription,
  cannotIdentify = false,
  setCannotIdentify,
}: ReportBasicInfoProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="animal-type">Τύπος ζώου *</Label>
        <Select value={animalType} onValueChange={setAnimalType}>
          <SelectTrigger>
            <SelectValue placeholder="Επιλέξτε τύπο ζώου" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dog">Σκύλος</SelectItem>
            <SelectItem value="cat">Γάτα</SelectItem>
            <SelectItem value="other">Άλλο</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="condition">Κατάσταση *</Label>
        <Select value={condition} onValueChange={setCondition}>
          <SelectTrigger>
            <SelectValue placeholder="Επιλέξτε κατάσταση" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="injured">Τραυματισμένο</SelectItem>
            <SelectItem value="sick">Άρρωστο</SelectItem>
            <SelectItem value="healthy">Υγιές</SelectItem>
            <SelectItem value="hungry">Πεινασμένο</SelectItem>
            <SelectItem value="lost">Χαμένο</SelectItem>
            <SelectItem value="unknown">Δεν γνωρίζω</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {setCannotIdentify && (
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="cannot-identify" 
            checked={cannotIdentify}
            onCheckedChange={(checked) => setCannotIdentify(checked as boolean)}
          />
          <Label htmlFor="cannot-identify" className="text-sm">
            Δεν μπορώ να προσδιορίσω
          </Label>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="description">Περιγραφή *</Label>
        <Textarea
          id="description"
          placeholder="Περιγράψτε την κατάσταση του ζώου και τις περιστάσεις..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[100px]"
        />
      </div>
    </div>
  );
};

export default ReportBasicInfo;
