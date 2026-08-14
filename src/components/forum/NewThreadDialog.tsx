
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ThreadImageUpload from "./ThreadImageUpload";
import { useForumCategories } from "@/hooks/useForumCategories";

interface NewThreadDialogProps {
  isAuthenticated: boolean;
  onCreateThread: (newThread: {
    title: string;
    content: string;
    category: string;
    images: File[];
  }) => Promise<void>;
  isLoading: boolean;
}

export const NewThreadDialog: React.FC<NewThreadDialogProps> = ({
  isAuthenticated,
  onCreateThread,
  isLoading,
}) => {
  const { data: categories } = useForumCategories();
  const [isOpen, setIsOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "general",
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const handleSubmit = async () => {
    await onCreateThread({
      ...newPost,
      images: selectedImages
    });
    setNewPost({ title: "", content: "", category: "general" });
    setSelectedImages([]);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-strays-orange hover:bg-strays-dark-orange">
          <Plus className="mr-2 h-4 w-4" /> Νέα Συζήτηση
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Δημιουργία νέας συζήτησης</DialogTitle>
          <DialogDescription>
            Συμπληρώστε τα παρακάτω πεδία για να δημιουργήσετε μια νέα συζήτηση
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Τίτλος</Label>
            <Input
              id="title"
              placeholder="Τίτλος συζήτησης"
              value={newPost.title}
              onChange={(e) =>
                setNewPost({ ...newPost, title: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Κατηγορία</Label>
            <Select
              value={newPost.category}
              onValueChange={(value) =>
                setNewPost({ ...newPost, category: value })
              }
            >
              <SelectTrigger id="category">
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
            <Label htmlFor="content">Περιεχόμενο</Label>
            <Textarea
              id="content"
              placeholder="Γράψτε το περιεχόμενο της συζήτησης..."
              className="min-h-[200px]"
              value={newPost.content}
              onChange={(e) =>
                setNewPost({ ...newPost, content: e.target.value })
              }
            />
          </div>
          <ThreadImageUpload 
            images={selectedImages}
            setImages={setSelectedImages}
            maxImages={3}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Ακύρωση
          </Button>
          <Button
            className="bg-strays-orange hover:bg-strays-dark-orange"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Αποθήκευση..." : "Δημοσίευση"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
