import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Search, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import StrayRegistrationForm from "@/components/stray/StrayRegistrationForm";

interface Stray {
  id: string;
  name: string;
  animal_type: string;
  age?: number;
  birth_year?: number;
  gender?: string;
  fur_colors?: string;
  location_description?: string;
  story?: string;
  image_urls?: string[];
  is_neutered?: boolean;
  registerer_username?: string;
}

const StrayAdoptions = () => {
  const { isAuthenticated } = useAuth();
  const [strays, setStrays] = useState<Stray[]>([]);
  const [filteredStrays, setFilteredStrays] = useState<Stray[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchStrays();
  }, []);

  useEffect(() => {
    filterStrays();
  }, [strays, searchTerm, selectedType]);

  const fetchStrays = async () => {
    try {
      const { data, error } = await supabase
        .from('strays')
        .select('*')
        .eq('available_for_adoption', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStrays((data || []) as never);
    } catch (error) {
      console.error('Error fetching strays:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterStrays = () => {
    let filtered = strays;

    if (searchTerm) {
      filtered = filtered.filter(stray =>
        stray.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stray.location_description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== "all") {
      filtered = filtered.filter(stray => stray.animal_type === selectedType);
    }

    setFilteredStrays(filtered);
  };

  const calculateAge = (stray: Stray) => {
    if (stray.age) return `${stray.age} ετών`;
    if (stray.birth_year) {
      const currentYear = new Date().getFullYear();
      const age = currentYear - stray.birth_year;
      return age > 0 ? `${age} ετών` : "Μωρό";
    }
    return "Άγνωστη ηλικία";
  };

  const getAnimalTypeLabel = (type: string) => {
    switch (type) {
      case 'cat': return 'Γάτα';
      case 'dog': return 'Σκύλος';
      default: return type;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Φόρτωση αδέσποτων...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Αδέσποτα προς Υιοθεσία</h1>
            <p className="text-lg text-gray-600">
              Βρείτε το νέο σας φίλο ανάμεσα στα καταγεγραμμένα αδέσποτα
            </p>
          </div>
          {isAuthenticated && (
            <Button onClick={() => setIsAddOpen(true)} className="shrink-0">
              <Plus className="mr-2 h-4 w-4" />
              Νέα Καταχώρηση
            </Button>
          )}
        </div>


        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
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

      {filteredStrays.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">
              {searchTerm || selectedType !== "all" 
                ? "Δεν βρέθηκαν αδέσποτα με τα συγκεκριμένα κριτήρια."
                : "Δεν υπάρχουν καταγεγραμμένα αδέσποτα ακόμα."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStrays.map((stray) => (
            <Card key={stray.id} className="hover:shadow-lg transition-shadow">
              <div className="relative">
                {stray.image_urls && stray.image_urls.length > 0 ? (
                  <img
                    src={stray.image_urls[0]}
                    alt={stray.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                    <span className="text-gray-400">Χωρίς φωτογραφία</span>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary">
                    {getAnimalTypeLabel(stray.animal_type)}
                  </Badge>
                </div>
              </div>

              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{stray.name}</span>
                  <Heart className="h-5 w-5 text-gray-400" />
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600">
                  <strong>Ηλικία:</strong> {calculateAge(stray)}
                </div>
                
                {stray.gender && (
                  <div className="text-sm text-gray-600">
                    <strong>Φύλο:</strong> {stray.gender === 'male' ? 'Αρσενικό' : 'Θηλυκό'}
                  </div>
                )}

                {stray.fur_colors && (
                  <div className="text-sm text-gray-600">
                    <strong>Χρώματα:</strong> {stray.fur_colors}
                  </div>
                )}

                {stray.is_neutered !== undefined && (
                  <div className="text-sm text-gray-600">
                    <strong>Στείρωση:</strong> {stray.is_neutered ? 'Ναι' : 'Όχι'}
                  </div>
                )}

                {stray.location_description && (
                  <div className="flex items-start text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                    <span>{stray.location_description}</span>
                  </div>
                )}

                {stray.story && (
                  <div className="text-sm text-gray-600">
                    <strong>Ιστορία:</strong> {stray.story.substring(0, 100)}
                    {stray.story.length > 100 && "..."}
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  Καταχωρήθηκε από: {stray.registerer_username || 'Άγνωστος'}
                </div>
              </CardContent>

              <div className="p-6 pt-0">
                {isAuthenticated ? (
                  <Button className="w-full">
                    Ενδιαφέρομαι για Υιοθεσία
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/login">Συνδεθείτε για Υιοθεσία</a>
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Καταχώρηση Αδέσποτου για Υιοθεσία</DialogTitle>
            <DialogDescription>
              Το αδέσποτο θα προστεθεί στο Μητρώο και θα εμφανιστεί στη σελίδα υιοθεσιών.
            </DialogDescription>
          </DialogHeader>
          <StrayRegistrationForm
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
            defaultAvailableForAdoption={true}
            onSuccess={() => {
              setIsAddOpen(false);
              fetchStrays();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StrayAdoptions;