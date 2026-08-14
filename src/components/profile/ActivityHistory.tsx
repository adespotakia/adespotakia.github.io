
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import ActivityCard from "./ActivityCard";
import ActivitySkeleton from "./ActivitySkeleton";
import EmptyActivityState from "./EmptyActivityState";

interface StrayActivity {
  id: string;
  activity_type: string;
  activity_description: string;
  notes: string;
  created_at: string;
  image_urls: string[];
  strays: {
    id: string;
    name: string;
    location_description: string;
  };
}

interface ActivityHistoryProps {
  userId: string;
}

const ActivityHistory = ({ userId }: ActivityHistoryProps) => {
  const [activities, setActivities] = useState<StrayActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // Get stray activity point records first
        const { data: pointActivities, error: pointError } = await supabase
          .from('point_activities')
          .select('reference_id')
          .eq('user_id', userId)
          .eq('activity_type', 'stray_activity')
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (pointError) throw pointError;
        
        if (!pointActivities || pointActivities.length === 0) {
          setActivities([]);
          return;
        }

        // Get the actual stray activities with stray information
        const activityIds = pointActivities.map(pa => pa.reference_id).filter((v): v is string => Boolean(v));
        
        if (activityIds.length === 0) {
          setActivities([]);
          return;
        }

        const { data: strayActivities, error: activitiesError } = await supabase
          .from('stray_activities')
          .select(`
            id,
            activity_type,
            activity_description,
            notes,
            created_at,
            image_urls,
            strays (
              id,
              name,
              location_description,
              image_urls
            )
          `)
          .in('id', activityIds)
          .order('created_at', { ascending: false });
        
        if (activitiesError) throw activitiesError;
        
        // Ensure image_urls is always an array
        const processedActivities = (strayActivities || []).map(activity => ({
          ...activity,
          image_urls: Array.isArray(activity.image_urls) ? activity.image_urls.filter((u: unknown): u is string => typeof u === "string") : []
        }));
        
        setActivities(processedActivities as unknown as StrayActivity[]);
      } catch (err) {
        console.error('Error fetching activities:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [userId]);

  if (isLoading) {
    return <ActivitySkeleton />;
  }

  return activities.length > 0 ? (
    <div className="space-y-6">
      {activities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
    </div>
  ) : (
    <EmptyActivityState />
  );
};

export default ActivityHistory;
