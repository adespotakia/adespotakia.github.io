
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ActivityDateSectionProps {
  activityDate: string;
  onActivityDateChange: (value: string) => void;
}

const ActivityDateSection = ({ activityDate, onActivityDateChange }: ActivityDateSectionProps) => {
  return (
    <div className="space-y-2">
      <Label>Ημερομηνία *</Label>
      <Input
        type="date"
        value={activityDate}
        onChange={(e) => onActivityDateChange(e.target.value)}
        required
      />
    </div>
  );
};

export default ActivityDateSection;
