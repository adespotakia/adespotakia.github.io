
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, MapPin, Heart, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import StrayTimelineDialog from "@/components/stray/StrayTimelineDialog";
import UserProfileModal from "@/components/profile/UserProfileModal";

interface Stray {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  characteristics?: string[];
  location_description?: string;
  story?: string;
  image_url?: string;
  image_urls?: string[];
  is_neutered: boolean;
  created_at: string;
  registered_by: string;
  registerer_username?: string;
  birth_year?: number;
  birth_month?: number;
}

const DogsRegistry = () => {
  const [strays, setStrays] = useState<Stray[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStrayId, setSelectedStrayId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchStrays();
  }, []);

  const calculateAge = (birthYear?: number, birthMonth?: number) => {
    if (!birthYear) return null;
    
    const now = new Date();
    const birthDate = new Date(birthYear, (birthMonth || 1) - 1);
    const diffTime = now.getTime() - birthDate.getTime();
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    
    return Math.floor(diffYears);
  };

  const fetchStrays = async () => {
    try {
      setIsLoading(true);
      
      // Fetch strays with their registerer information - filter for dogs only
      const { data: straysData, error: straysError } = await supabase
        .from('strays')
        .select('*')
        .eq('animal_type', 'dog') // Filter for dogs only
        .order('created_at', { ascending: false });

      if (straysError) throw straysError;

      if (straysData && straysData.length > 0) {
        // Get unique user IDs
        const userIds = [...new Set(straysData.map(stray => stray.registered_by))];
        
        // Fetch profiles for these users
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', userIds);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
        }

        // Create a map of user IDs to usernames
        const profilesMap: Record<string, string> = {};
        if (profilesData) {
          profilesData.forEach(profile => {
            profilesMap[profile.id] = profile.username;
          });
        }

        // Format the strays data
        const formattedStrays = straysData.map(stray => ({
          ...stray,
          registerer_username: profilesMap[stray.registered_by] || "Ανώνυμος"
        }));

        setStrays(formattedStrays as unknown as Stray[]);
      }
    } catch (error) {
      console.error('Error fetching strays:', error);
      toast({
        title: "Σφάλμα",
        description: "Δεν ήταν δυνατή η φόρτωση των σκύλων",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p>Φόρτωση σκύλων...</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Μητρώο Σκύλου</h2>
          <p className="text-gray-600 text-sm">
            Όλοι οι σκύλοι που έχουν καταχωρηθεί στην πλατφόρμα
          </p>
        </div>

        {strays.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Δεν υπάρχουν καταχωρημένοι σκύλοι ακόμα</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {strays.map((stray) => {
              const calculatedAge = calculateAge(stray.birth_year, stray.birth_month) || stray.age;
              
              return (
                <Card key={stray.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    {stray.image_url && (
                      <div className="relative w-full h-48 mb-3 rounded-md overflow-hidden bg-gray-100">
                        <img
                          src={stray.image_url}
                          alt={stray.name}
                          className="w-full h-full object-contain hover:object-cover transition-all duration-300 cursor-pointer"
                          title="Κλικ για εναλλαγή προβολής"
                        />
                      </div>
                    )}
                    <CardTitle className="text-lg">{stray.name}</CardTitle>
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="h-4 w-4 mr-1" />
                      Καταχωρήθηκε από:{" "}
                      <button 
                        onClick={() => setSelectedUserId(stray.registered_by)}
                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium ml-1"
                      >
                        {stray.registerer_username}
                      </button>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(stray.created_at).toLocaleDateString('el-GR')}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {calculatedAge && (
                        <div>
                          <span className="font-medium">Ηλικία:</span> {calculatedAge} έτη
                        </div>
                      )}
                      {stray.gender && (
                        <div>
                          <span className="font-medium">Φύλο:</span> {
                            stray.gender === 'male' ? 'Αρσενικό' : 
                            stray.gender === 'female' ? 'Θηλυκό' : 'Άγνωστο'
                          }
                        </div>
                      )}
                    </div>

                    {stray.location_description && (
                      <div className="flex items-start text-sm">
                        <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{stray.location_description}</span>
                      </div>
                    )}

                    {stray.characteristics && stray.characteristics.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {stray.characteristics.map((char, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {char}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="space-y-2 pt-2">
                      <div className="flex justify-start">
                        <Badge variant={stray.is_neutered ? "default" : "outline"}>
                          {stray.is_neutered ? "Στειρωμένο" : "Μη στειρωμένο"}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-start">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedStrayId(stray.id)}
                          className="flex items-center gap-1"
                        >
                          <Clock className="h-3 w-3" />
                          Αρχείο δραστηριοτήτων
                        </Button>
                      </div>
                    </div>

                    {stray.story && (
                      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
                        <p className="line-clamp-3">{stray.story}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {selectedStrayId && (
          <StrayTimelineDialog
            strayId={selectedStrayId}
            isOpen={!!selectedStrayId}
            onClose={() => setSelectedStrayId(null)}
          />
        )}

        {selectedUserId && (
          <UserProfileModal 
            userId={selectedUserId}
            onClose={() => setSelectedUserId(null)}
          />
        )}
      </div>
    </>
  );
};

export default DogsRegistry;
