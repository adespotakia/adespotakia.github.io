import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForumCategories } from "@/hooks/useForumCategories";

interface EditThreadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  thread: { id: string; title: string; content: string; category: string };
  onUpdated?: () => void;
}

const EditThreadDialog = ({ open, onOpenChange, thread, onUpdated }: EditThreadDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: categories } = useForumCategories();
  const [title, setTitle] = useState(thread.title);
  const [content, setContent] = useState(thread.content);
  const [category, setCategory] = useState(thread.category);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("forum_threads")
        .update({ title, content, category })
        .eq("id", thread.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["thread", thread.id] });
      toast({ title: "Επιτυχία", description: "Η συζήτηση ενημερώθηκε." });
      onOpenChange(false);
      onUpdated?.();
    },
    onError: (error: any) => {
      toast({
        title: "Σφάλμα",
        description: error.message || "Δεν ήταν δυνατή η ενημέρωση.",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Επεξεργασία συζήτησης</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-title">Τίτλος</Label>
            <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-category">Κατηγορία</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="edit-category">
                <SelectValue placeholder="Επιλέξτε κατηγορία" />
              </SelectTrigger>
              <SelectContent>
                {(categories || []).map((c) => (
                  <SelectItem key={c.id} value={c.slug}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-content">Περιεχόμενο</Label>
            <Textarea
              id="edit-content"
              className="min-h-[200px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Ακύρωση
          </Button>
          <Button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending || !title.trim() || !content.trim()}
          >
            {updateMutation.isPending ? "Αποθήκευση..." : "Αποθήκευση"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditThreadDialog;
