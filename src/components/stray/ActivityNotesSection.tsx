
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ActivityNotesSectionProps {
  notes: string;
  onNotesChange: (value: string) => void;
}

const ActivityNotesSection = ({ notes, onNotesChange }: ActivityNotesSectionProps) => {
  return (
    <div className="space-y-2">
      <Label>Σημειώσεις</Label>
      <Textarea
        placeholder="Προαιρετικές σημειώσεις..."
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
      />
    </div>
  );
};

export default ActivityNotesSection;
