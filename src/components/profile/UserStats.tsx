
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface UserStatsProps {
  userId: string;
}

const UserStats = ({ userId }: UserStatsProps) => {
  const { toast } = useToast();
  const [userStats, setUserStats] = useState({
    reports_count: 0,
    forum_posts: 0,
    total_points: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get user rank data
        const { data: rankData, error: rankError } = await supabase
          .from('user_ranks')
          .select('points, reports_count')
          .eq('id', userId)
          .single();
        
        if (rankError && rankError.code !== 'PGRST116') {
          throw rankError;
        }
        
        // Get recent activities
        const { data: activityData, error: activityError } = await supabase
          .from('point_activities')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (activityError) throw activityError;
        
        // Count forum posts (placeholder for when we add forum)
        const forumPosts = activityData?.filter(a => 
          a.activity_type === 'forum_post' || a.activity_type === 'forum_comment'
        ).length || 0;
        
        setUserStats({
          reports_count: rankData?.reports_count || 0,
          forum_posts: forumPosts,
          total_points: rankData?.points || 0
        });
      } catch (err) {
        console.error('Error fetching user stats:', err);
        toast({
          title: "Σφάλμα",
          description: "Αδυναμία φόρτωσης στοιχείων προφίλ",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [userId, toast]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-medium">Συνολικοί πόντοι</h4>
          <p className="text-sm text-gray-500">Πόντοι που έχετε συγκεντρώσει</p>
        </div>
        <span className="text-2xl font-bold">{isLoading ? "-" : userStats.total_points}</span>
      </div>
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-medium">Αναφορές αδέσποτων</h4>
          <p className="text-sm text-gray-500">Συνολικές αναφορές</p>
        </div>
        <span className="text-2xl font-bold">{isLoading ? "-" : userStats.reports_count}</span>
      </div>
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-medium">Συζητήσεις</h4>
          <p className="text-sm text-gray-500">Συμμετοχές σε συζητήσεις</p>
        </div>
        <span className="text-2xl font-bold">{isLoading ? "-" : userStats.forum_posts}</span>
      </div>
    </div>
  );
};

export default UserStats;
