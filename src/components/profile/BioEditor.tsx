
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Save, X } from "lucide-react";

interface BioEditorProps {
  bio: string | null;
  firstName?: string | null;
  lastName?: string | null;
  onBioUpdate: (newBio: string) => void;
}

const BioEditor = ({ bio, firstName, lastName, onBioUpdate }: BioEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState(bio || "");
  const [editFirstName, setEditFirstName] = useState(firstName || "");
  const [editLastName, setEditLastName] = useState(lastName || "");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          bio: editBio,
          first_name: editFirstName.trim() || null,
          last_name: editLastName.trim() || null,
        })
        .eq('id', user.id);

      if (error) throw error;

      onBioUpdate(editBio);
      setIsEditing(false);
      toast({
        title: "Επιτυχία",
        description: "Το βιογραφικό σας ενημερώθηκε",
      });
    } catch (error) {
      console.error('Error updating bio:', error);
      toast({
        title: "Σφάλμα",
        description: "Δεν ήταν δυνατή η ενημέρωση του βιογραφικού",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditBio(bio || "");
    setEditFirstName(firstName || "");
    setEditLastName(lastName || "");
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="first-name">Όνομα (προαιρετικό)</Label>
            <Input
              id="first-name"
              value={editFirstName}
              onChange={(e) => setEditFirstName(e.target.value)}
              placeholder="Όνομα"
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last-name">Επώνυμο (προαιρετικό)</Label>
            <Input
              id="last-name"
              value={editLastName}
              onChange={(e) => setEditLastName(e.target.value)}
              placeholder="Επώνυμο"
              maxLength={100}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Βιογραφικό</Label>
          <Textarea
            id="bio"
            value={editBio}
            onChange={(e) => setEditBio(e.target.value)}
            placeholder="Πείτε μας λίγα λόγια για εσάς..."
            className="min-h-[100px]"
            maxLength={500}
          />
          <p className="text-xs text-gray-500">
            {editBio.length}/500 χαρακτήρες
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            size="sm"
            className="flex items-center gap-1"
          >
            <Save className="h-4 w-4" />
            Αποθήκευση
          </Button>
          <Button
            onClick={handleCancel}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            Ακύρωση
          </Button>
        </div>
      </div>
    );
  }

  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-start">
        <div className="flex-1 space-y-2">
          {fullName && (
            <p className="font-medium text-gray-900">{fullName}</p>
          )}
          {bio ? (
            <p className="text-gray-700 whitespace-pre-wrap">{bio}</p>
          ) : (
            <p className="text-gray-500 italic">
              Δεν έχετε προσθέσει βιογραφικό ακόμη. Κάντε κλικ για να προσθέσετε.
            </p>
          )}
        </div>
        <Button
          onClick={() => setIsEditing(true)}
          variant="ghost"
          size="sm"
          className="flex items-center gap-1"
        >
          <Pencil className="h-4 w-4" />
          Επεξεργασία
        </Button>
      </div>
    </div>
  );
};

export default BioEditor;
