
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useStrayActivities = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    stray_id: "",
    activity_type: "",
    activity_description: "",
    notes: "",
    food_type: "",
    activity_date: new Date().toISOString().split('T')[0],
    location_description: ""
  });
  
  const [straySearch, setStraySearch] = useState("");
  const [selectedStray, setSelectedStray] = useState<any>(null);
  const [activityImages, setActivityImages] = useState<File[]>([]);
  const [coordinates, setCoordinates] = useState({ lat: "", lng: "" });

  // Search for strays based on input
  const { data: searchResults } = useQuery({
    queryKey: ['stray-search', straySearch],
    queryFn: async () => {
      if (straySearch.length < 1) return [];
      
      const { data, error } = await supabase
        .from('strays')
        .select('id, name, location_description, registered_by, registerer_username, image_url')
        .ilike('name', `${straySearch}%`)
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    enabled: straySearch.length >= 1 && !selectedStray
  });

  // Get recent activities
  const { data: recentActivities, isLoading } = useQuery({
    queryKey: ['stray-activities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stray_activities')
        .select(`
          *,
          strays(name, location_description)
        `)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      
      // Get user profiles separately for the activities
      const userIds = data?.map(activity => activity.user_id).filter(Boolean) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds);
      
      // Combine the data
      const activitiesWithProfiles = data?.map(activity => ({
        ...activity,
        profile: profiles?.find(p => p.id === activity.user_id)
      }));
      
      return activitiesWithProfiles;
    }
  });

  // Create activity mutation
  const createActivityMutation = useMutation({
    mutationFn: async (activityData: any) => {
      console.log("Starting activity creation with data:", activityData);
      
      // Validate required fields
      if (!activityData.stray_id) {
        throw new Error("Δεν έχει επιλεγεί αδέσποτο");
      }
      
      if (!activityData.activity_type) {
        throw new Error("Δεν έχει επιλεγεί τύπος δραστηριότητας");
      }
      
      if (!activityData.activity_description) {
        throw new Error("Δεν έχει συμπληρωθεί περιγραφή δραστηριότητας");
      }
      
      if (!user?.id) {
        throw new Error("Δεν είστε συνδεδεμένος");
      }

      console.log("Validation passed, inserting to database...");
      
      const { data: insertedActivity, error } = await supabase
        .from('stray_activities')
        .insert({
          stray_id: activityData.stray_id,
          activity_type: activityData.activity_type,
          activity_description: activityData.activity_description,
          notes: activityData.notes,
          quantity: activityData.quantity,
          unit: activityData.unit,
          activity_date: activityData.activity_date,
          location_description: activityData.location_description || null,
          location_lat: activityData.location_lat,
          location_lng: activityData.location_lng,
          user_id: user.id
        })
        .select()
        .single();
      
      if (error) {
        console.error("Database error:", error);
        throw new Error(`Σφάλμα βάσης δεδομένων: ${error.message}`);
      }
      
      console.log("Activity created successfully, awarding points...");
      
      // Award 3 points for stray activity
      await supabase.rpc('add_user_points', {
        user_id: user.id,
        activity_type: 'stray_activity',
        points_to_add: 3,
        reference_id: insertedActivity.id
      });
      
      console.log("Points awarded successfully");
      
      return insertedActivity;
    },
    onSuccess: () => {
      toast({
        title: "Επιτυχία!",
        description: "Η δραστηριότητα καταγράφηκε επιτυχώς και κερδίσατε 3 πόντους!",
      });
      queryClient.invalidateQueries({ queryKey: ['stray-activities'] });
      queryClient.invalidateQueries({ queryKey: ['point-activities'] });
      resetForm();
    },
    onError: (error: any) => {
      console.error("Mutation error:", error);
      toast({
        title: "Σφάλμα",
        description: error.message || "Αποτυχία καταγραφής δραστηριότητας",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Parent handleSubmit called");
    console.log("Selected stray:", selectedStray);
    console.log("Form data:", formData);
    console.log("Coordinates:", coordinates);

    createActivityMutation.mutate({
      stray_id: selectedStray.id,
      activity_type: formData.activity_type,
      activity_description: formData.activity_description,
      notes: formData.notes,
      quantity: formData.food_type ? 1 : null,
      unit: formData.food_type || null,
      activity_date: formData.activity_date,
      location_description: formData.location_description,
      location_lat: parseFloat(coordinates.lat),
      location_lng: parseFloat(coordinates.lng)
    });
  };

  const resetForm = () => {
    setFormData({
      stray_id: "",
      activity_type: "",
      activity_description: "",
      notes: "",
      food_type: "",
      activity_date: new Date().toISOString().split('T')[0],
      location_description: ""
    });
    setSelectedStray(null);
    setStraySearch("");
    setActivityImages([]);
    setCoordinates({ lat: "", lng: "" });
  };

  return {
    formData,
    setFormData,
    straySearch,
    setStraySearch,
    selectedStray,
    setSelectedStray,
    activityImages,
    setActivityImages,
    coordinates,
    setCoordinates,
    searchResults,
    recentActivities,
    isLoading,
    handleSubmit,
    isSubmitting: createActivityMutation.isPending
  };
};
