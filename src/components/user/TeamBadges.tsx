
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Award } from "lucide-react";

interface TeamBadgesProps {
  userId: string;
}

const TeamBadges = ({ userId }: TeamBadgesProps) => {
  const { data: badges, isLoading } = useQuery({
    queryKey: ['teamBadges', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_badges')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading || !badges || badges.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
        <Award className="h-4 w-4" />
        Ομάδα
      </h4>
      <div className="flex flex-wrap gap-2">
        {badges.map((badge) => (
          <Badge 
            key={badge.id} 
            className="text-white"
            style={{ backgroundColor: badge.badge_color }}
          >
            {badge.badge_name}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default TeamBadges;
