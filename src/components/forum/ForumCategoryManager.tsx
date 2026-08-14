import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { useForumCategories, ForumCategory } from "@/hooks/useForumCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const ForumCategoryManager = () => {
  const { isAdmin } = useUserRole();
  const { data: categories } = useForumCategories();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const addMutation = useMutation({
    mutationFn: async () => {
      const slug = slugify(name);
      if (!slug) throw new Error("Μη έγκυρο όνομα κατηγορίας");
      const { error } = await supabase
        .from("forum_categories")
        .insert([{ name: name.trim(), slug, color: "bg-gray-100 text-gray-800" }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-categories"] });
      setName("");
      toast({ title: "Επιτυχία", description: "Η κατηγορία προστέθηκε." });
    },
    onError: (error: any) => {
      toast({ title: "Σφάλμα", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (cat: ForumCategory) => {
      const { error } = await supabase.from("forum_categories").delete().eq("id", cat.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-categories"] });
      toast({ title: "Επιτυχία", description: "Η κατηγορία διαγράφηκε." });
    },
    onError: (error: any) => {
      toast({ title: "Σφάλμα", description: error.message, variant: "destructive" });
    },
  });

  if (!isAdmin) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" /> Διαχείριση κατηγοριών
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Διαχείριση κατηγοριών</DialogTitle>
        </DialogHeader>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Νέα κατηγορία</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end gap-2">
            <div className="flex-1 grid gap-2">
              <Label htmlFor="cat-name">Όνομα</Label>
              <Input
                id="cat-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="π.χ. Υιοθεσίες"
              />
            </div>
            <Button onClick={() => addMutation.mutate()} disabled={!name.trim() || addMutation.isPending}>
              <Plus className="mr-1 h-4 w-4" /> Προσθήκη
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-2 mt-2">
          {(categories || []).map((c) => (
            <div key={c.id} className="flex items-center justify-between border rounded-md px-3 py-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.color}`}>{c.name}</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-800"
                onClick={() => deleteMutation.mutate(c)}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ForumCategoryManager;
