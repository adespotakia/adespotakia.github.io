
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface RankLevel {
  id: number;
  name: string;
  min_points: number;
  badge_color: string;
}

interface UserRankProps {
  userId?: string;
  showProgress?: boolean;
  showBadge?: boolean;
  size?: "sm" | "md" | "lg";
}

const UserRank = ({ 
  userId, 
  showProgress = true, 
  showBadge = true,
  size = "md" 
}: UserRankProps) => {
  const { user } = useAuth();
  const [points, setPoints] = useState(0);
  const [rank, setRank] = useState<RankLevel | null>(null);
  const [nextRank, setNextRank] = useState<RankLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [specialRole, setSpecialRole] = useState<string | null>(null);

  const targetId = userId || (user?.id ?? null);

  useEffect(() => {
    if (!targetId) {
      setLoading(false);
      return;
    }

    const fetchUserRank = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Check if the user is an administrator
        const { data: adminData } = await supabase
          .rpc('is_admin', { check_user_id: targetId });
        setIsAdmin(!!adminData);

        // Get the user's special role (e.g. supervisor)
        const { data: roleData } = await supabase
          .rpc('get_user_role', { check_user_id: targetId });
        setSpecialRole((roleData as string) || null);

        // Get user's current rank info
        const { data: userData, error: userError } = await supabase
          .from('user_ranks')
          .select('points, current_rank_id')
          .eq('id', targetId)
          .single();
          
        if (userError) throw userError;
        
        // Get all rank levels
        const { data: rankLevels, error: rankError } = await supabase
          .from('rank_levels')
          .select('*')
          .order('min_points', { ascending: true });
          
        if (rankError) throw rankError;
        
        if (userData && rankLevels) {
          setPoints(userData.points || 0);
          
          // Find current rank
          const currentRank = rankLevels.find(r => r.id === userData.current_rank_id);
          setRank(currentRank || rankLevels[0]);
          
          // Find next rank
          if (currentRank) {
            const currentRankIndex = rankLevels.findIndex(r => r.id === currentRank.id);
            setNextRank(rankLevels[currentRankIndex + 1] || null);
          } else {
            setNextRank(rankLevels[1] || null);
          }
        } else {
          // New user, default to first rank
          if (rankLevels && rankLevels.length > 0) {
            setRank(rankLevels[0]);
            setNextRank(rankLevels.length > 1 ? rankLevels[1] : null);
          }
        }
      } catch (err) {
        console.error('Error fetching rank:', err);
        setError('Αδυναμία φόρτωσης επιπέδου χρήστη');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRank();
  }, [targetId]);

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className={`h-${size === "sm" ? "3" : size === "lg" ? "6" : "4"} w-16 bg-gray-200 animate-pulse rounded-full`}></div>
      </div>
    );
  }

  if (error || !rank) {
    return null;
  }

  const progressPercent = nextRank 
    ? Math.min(100, ((points - rank.min_points) / (nextRank.min_points - rank.min_points)) * 100) 
    : 100;

  const isSupervisor = specialRole === "supervisor";
  const specialLabel = isAdmin ? "Διαχειριστής" : isSupervisor ? "Επόπτης" : null;
  const specialColor = isAdmin ? "#ef4444" : "#7c3aed";
  const badgeSizeClass = size === "sm" ? "text-xs px-2 py-0.5" : size === "lg" ? "text-base px-3 py-1" : "text-sm";

  return (
    <div className={`flex ${showProgress ? "flex-col" : ""} ${size === "sm" ? "items-center" : size === "lg" ? "items-start gap-1" : "items-center"}`}>
      {showBadge && (
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Platform level rank earned through activity */}
          <Badge 
            className={`text-white ${badgeSizeClass}`}
            style={{ backgroundColor: rank.badge_color }}
          >
            {rank.name}
          </Badge>
          {/* Special role rank (admin / supervisor) */}
          {specialLabel && (
            <Badge 
              className={`text-white ${badgeSizeClass}`}
              style={{ backgroundColor: specialColor }}
            >
              {specialLabel}
            </Badge>
          )}
        </div>
      )}
      
      {showProgress && nextRank && (
        <div className={`${size === "sm" ? "w-16 mt-1" : size === "lg" ? "w-full mt-2" : "w-32 mt-1"} flex flex-col gap-1`}>
          <Progress value={progressPercent} className="h-1" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{points} πόντοι</span>
            <span>{nextRank.min_points}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRank;
