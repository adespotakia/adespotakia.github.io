
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { User, Calendar } from "lucide-react";

interface StrayActivity {
  id: string;
  activity_type: string;
  activity_description: string;
  activity_date: string;
  created_at: string;
  user_id: string;
  notes: string | null;
  quantity: number | null;
  unit: string | null;
}

interface Stray {
  id: string;
  name: string;
  age: number | null;
  fur_colors: string | null;
  is_neutered: boolean;
  neutering_vet: string | null;
  neutering_date: string | null;
  possible_relatives: string | null;
  expenses_paid_by: string | null;
  created_at: string;
}

interface StrayTimelineDialogProps {
  strayId: string;
  isOpen: boolean;
  onClose: () => void;
}

const StrayTimelineDialog = ({ 
  strayId, 
  isOpen, 
  onClose 
}: StrayTimelineDialogProps) => {
  const [activities, setActivities] = useState<StrayActivity[]>([]);
  const [stray, setStray] = useState<Stray | null>(null);
  const [userProfiles, setUserProfiles] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && strayId) {
      fetchStrayAndActivities();
    }
  }, [isOpen, strayId]);

  const fetchStrayAndActivities = async () => {
    try {
      setIsLoading(true);
      
      // Fetch stray details
      const { data: strayData, error: strayError } = await supabase
        .from('strays')
        .select('*')
        .eq('id', strayId)
        .single();
      
      if (strayError) throw strayError;
      setStray(strayData as never);
      
      // Fetch the activities from stray_activities table
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('stray_activities')
        .select('*')
        .eq('stray_id', strayId)
        .order('activity_date', { ascending: false });
      
      if (activitiesError) throw activitiesError;
      
      if (activitiesData && activitiesData.length > 0) {
        // Get unique user IDs
        const userIds = [...new Set(activitiesData.map(activity => activity.user_id))];
        
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
        
        setActivities(activitiesData);
        setUserProfiles(profilesMap);
      } else {
        setActivities([]);
        setUserProfiles({});
      }
    } catch (err) {
      console.error('Error fetching stray and activities:', err);
      setStray(null);
      setActivities([]);
      setUserProfiles({});
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('el-GR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const getActivityTypeColor = (activityType: string) => {
    switch (activityType) {
      case 'feeding':
        return 'bg-orange-100 text-orange-800';
      case 'medical':
        return 'bg-red-100 text-red-800';
      case 'grooming':
        return 'bg-blue-100 text-blue-800';
      case 'vaccination':
        return 'bg-purple-100 text-purple-800';
      case 'pill':
        return 'bg-green-100 text-green-800';
      case 'other':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityTypeLabel = (activityType: string) => {
    switch (activityType) {
      case 'feeding':
        return 'Ταΐσμα';
      case 'medical':
        return 'Ιατρική Περίθαλψη';
      case 'grooming':
        return 'Περιποίηση';
      case 'vaccination':
        return 'Εμβολιασμός';
      case 'pill':
        return 'Χάπι';
      case 'other':
        return 'Άλλο';
      default:
        return activityType;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Αρχείο Δραστηριοτήτων: {stray?.name || 'Φόρτωση...'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-gray-200 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : activities.length > 0 ? (
            activities.map((activity) => (
              <Card key={activity.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={getActivityTypeColor(activity.activity_type)}>
                      {getActivityTypeLabel(activity.activity_type)}
                    </Badge>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(activity.activity_date)}
                    </div>
                  </div>
                  
                  <p className="text-sm mb-2">{activity.activity_description}</p>
                  
                  {activity.notes && (
                    <p className="text-sm text-gray-600 italic bg-gray-50 p-2 rounded mb-2">
                      {activity.notes}
                    </p>
                  )}
                  
                  {activity.quantity && activity.unit && (
                    <p className="text-sm text-blue-600 mb-2">
                      Ποσότητα: {activity.quantity} {activity.unit}
                    </p>
                  )}
                  
                  <div className="flex items-center text-xs text-gray-400">
                    <User className="w-3 h-3 mr-1" />
                    {userProfiles[activity.user_id] || 'Άγνωστος χρήστης'}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">
              Δεν υπάρχουν καταγεγραμμένες δραστηριότητες για αυτόν τον αδέσποτο.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StrayTimelineDialog;
