
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ActivityTypeSectionProps {
  activityType: string;
  onActivityTypeChange: (value: string) => void;
}

const ActivityTypeSection = ({ activityType, onActivityTypeChange }: ActivityTypeSectionProps) => {
  return (
    <div className="space-y-2">
      <Label>Τύπος Δραστηριότητας *</Label>
      <Select
        value={activityType}
        onValueChange={onActivityTypeChange}
        required
      >
        <SelectTrigger>
          <SelectValue placeholder="Επιλέξτε τύπο δραστηριότητας" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="feeding">Ταΐσμα</SelectItem>
          <SelectItem value="medical">Ιατρική Περίθαλψη</SelectItem>
          <SelectItem value="grooming">Περιποίηση</SelectItem>
          <SelectItem value="vaccination">Εμβολιασμός</SelectItem>
          <SelectItem value="pill">Χάπι</SelectItem>
          <SelectItem value="other">Άλλο</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ActivityTypeSection;
