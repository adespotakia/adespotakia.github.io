
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ActivityDescriptionSectionProps {
  activityType: string;
  activityDescription: string;
  onActivityDescriptionChange: (value: string) => void;
}

const ActivityDescriptionSection = ({ 
  activityType, 
  activityDescription, 
  onActivityDescriptionChange 
}: ActivityDescriptionSectionProps) => {
  return (
    <div className="space-y-2">
      <Label>Περιγραφή Δραστηριότητας</Label>
      {activityType === 'feeding' ? (
        <Select
          value={activityDescription}
          onValueChange={onActivityDescriptionChange}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Επιλέξτε τύπο φαγητού" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Κροκέτες">Κροκέτες</SelectItem>
            <SelectItem value="Κονσέρβα">Κονσέρβα</SelectItem>
            <SelectItem value="Μαγειρεμένο φαγητό">Μαγειρεμένο φαγητό</SelectItem>
          </SelectContent>
        </Select>
      ) : (
        <Input
          placeholder="π.χ. Παραχώρηση φαρμάκων"
          value={activityDescription}
          onChange={(e) => onActivityDescriptionChange(e.target.value)}
          required
        />
      )}
    </div>
  );
};

export default ActivityDescriptionSection;
