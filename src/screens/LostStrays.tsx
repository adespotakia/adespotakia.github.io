import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MapPin, Search, Plus, AlertTriangle } from "lucide-react";

interface LostStray {
  id: string;
  registerer_name: string;
  name: string;
  animal_type: string;
  image_url?: string | null;
  locations?: string | null;
  is_urgent: boolean;
}

const LostStrays = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<LostStray[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registererName, setRegistererName] = useState("");
  const [strayName, setStrayName] = useState("");
  const [animalType, setAnimalType] = useState("dog");
  const [locations, setLocations] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from("lost_strays" as never)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setItems((data || []) as never);
    } catch (error) {
      console.error("Error fetching lost strays:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = items.filter((item) => {
    const matchesSearch =
      !searchTerm ||
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.locations?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || item.animal_type === selectedType;
    return matchesSearch && matchesType;
  });

  const getAnimalTypeLabel = (type: string) =>
    type === "cat" ? "Γάτα" : type === "dog" ? "Σκύλος" : type;

  const resetForm = () => {
    setRegistererName("");
    setStrayName("");
    setAnimalType("dog");
    setLocations("");
    setIsUrgent(false);
    setImageFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    if (!registererName.trim() || !strayName.trim()) {
      toast({
        title: "Συμπληρώστε τα υποχρεωτικά πεδία",
        description: "Όνομα μέλους και όνομα αδέσποτου είναι απαραίτητα.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl: string | null = null;
      if (imageFile) {
        const ext = imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
        const fileName = `${user.id}/${Date.now()}_${Math.random()
          .toString(36)
          .substring(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("lost-strays")
          .upload(fileName, imageFile, { cacheControl: "3600", upsert: false });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from("lost-strays")
          .getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from("lost_strays" as never).insert([
        {
          user_id: user.id,
          registerer_name: registererName.trim(),
          name: strayName.trim(),
          animal_type: animalType,
          image_url: imageUrl,
          locations: locations.trim() || null,
          is_urgent: isUrgent,
        },
      ] as never);
      if (error) throw error;

      toast({
        title: "Επιτυχής καταχώρηση!",
        description: "Το χαμένο αδέσποτο καταχωρήθηκε.",
      });
      resetForm();
      setDialogOpen(false);
      fetchItems();
    } catch (error) {
      console.error("Error adding lost stray:", error);
      toast({
        title: "Σφάλμα",
        description:
          error instanceof Error ? error.message : "Υπήρξε πρόβλημα κατά την καταχώρηση.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Χαμένα Αδέσποτα</h1>
            <p className="text-lg text-gray-600">
              Βοηθήστε να βρεθούν τα χαμένα αδέσποτα της γειτονιάς
            </p>
          </div>

          {isAuthenticated && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-strays-orange hover:bg-strays-dark-orange shrink-0">
                  <Plus className="h-4 w-4 mr-2" />
                  Προσθήκη
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Προσθήκη Χαμένου Αδέσποτου</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Όνομα μέλους που καταχωρεί *</Label>
                    <Input
                      value={registererName}
                      onChange={(e) => setRegistererName(e.target.value)}
                      placeholder="Το όνομά σας"
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Όνομα χαμένου αδέσποτου *</Label>
                    <Input
                      value={strayName}
                      onChange={(e) => setStrayName(e.target.value)}
                      placeholder="Όνομα αδέσποτου"
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Είδος</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={animalType === "dog" ? "default" : "outline"}
                        onClick={() => setAnimalType("dog")}
                        size="sm"
                      >
                        Σκύλος
                      </Button>
                      <Button
                        type="button"
                        variant={animalType === "cat" ? "default" : "outline"}
                        onClick={() => setAnimalType("cat")}
                        size="sm"
                      >
                        Γάτα
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Φωτογραφία</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Σημείο που σύχναζε & πιθανές άλλες τοποθεσίες</Label>
                    <Textarea
                      value={locations}
                      onChange={(e) => setLocations(e.target.value)}
                      placeholder="π.χ. πλατεία, γειτονιά, σημεία που μπορεί να βρίσκεται..."
                    />
                  </div>
                  <div className="flex items-start space-x-3 rounded-md border p-4">
                    <Checkbox
                      id="urgent"
                      checked={isUrgent}
                      onCheckedChange={(c) => setIsUrgent(c === true)}
                    />
                    <div className="space-y-1 leading-none">
                      <Label htmlFor="urgent">Επείγον</Label>
                      <p className="text-sm text-muted-foreground">
                        Επιλέξτε αν το αδέσποτο χρειάζεται φαρμακευτική αγωγή.
                      </p>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Καταχώρηση..." : "Καταχώρηση"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Αναζήτηση με όνομα ή τοποθεσία..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedType === "all" ? "default" : "outline"}
              onClick={() => setSelectedType("all")}
              size="sm"
            >
              Όλα
            </Button>
            <Button
              variant={selectedType === "dog" ? "default" : "outline"}
              onClick={() => setSelectedType("dog")}
              size="sm"
            >
              Σκύλοι
            </Button>
            <Button
              variant={selectedType === "cat" ? "default" : "outline"}
              onClick={() => setSelectedType("cat")}
              size="sm"
            >
              Γάτες
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center">Φόρτωση...</div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">
              {searchTerm || selectedType !== "all"
                ? "Δεν βρέθηκαν χαμένα αδέσποτα με τα συγκεκριμένα κριτήρια."
                : "Δεν υπάρχουν καταχωρημένα χαμένα αδέσποτα ακόμα."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <div className="relative">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                    <span className="text-gray-400">Χωρίς φωτογραφία</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                  <Badge variant="secondary">{getAnimalTypeLabel(item.animal_type)}</Badge>
                  {item.is_urgent && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Επείγον
                    </Badge>
                  )}
                </div>
              </div>
              <CardHeader>
                <CardTitle>{item.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {item.locations && (
                  <div className="flex items-start text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                    <span>{item.locations}</span>
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  Καταχωρήθηκε από: {item.registerer_name}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LostStrays;
