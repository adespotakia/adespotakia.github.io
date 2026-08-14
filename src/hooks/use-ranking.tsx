
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface RankResult {
  success: boolean;
  points: number;
  newRank?: {
    id: number;
    name: string;
    badge_color: string;
  };
  error?: string;
}

export const useRanking = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Award points to the current user for an activity
   */
  const awardPoints = async (
    activityType: string,
    points: number,
    referenceId?: string
  ): Promise<RankResult> => {
    if (!user) {
      return {
        success: false,
        points: 0,
        error: "Ο χρήστης δεν είναι συνδεδεμένος"
      };
    }

    setIsProcessing(true);
    
    try {
      // Call the RPC function to add points
      const { error } = await supabase.rpc('add_user_points', {
        user_id: user.id,
        activity_type: activityType,
        points_to_add: points,
        reference_id: referenceId
      });

      if (error) throw error;

      // Get updated user rank info
      const { data: rankData, error: rankError } = await supabase
        .from('user_ranks')
        .select('points, current_rank_id')
        .eq('id', user.id)
        .single();
      
      if (rankError) throw rankError;

      // Get rank name and color
      const { data: rankDetails, error: detailsError } = await supabase
        .from('rank_levels')
        .select('name, badge_color')
        .eq("id", rankData.current_rank_id as number)
        .single();
      
      if (detailsError) throw detailsError;

      // Check if previous rank data exists to determine if rank up happened
      const { data: prevActivity } = await supabase
        .from('point_activities')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(2);
      
      const isRankUp = prevActivity && prevActivity.length > 1;

      // Show toast for points earned
      toast({
        title: `+${points} πόντοι!`,
        description: `Κερδίσατε ${points} πόντους για ${activityTypeToText(activityType)}`,
      });

      return {
        success: true,
        points: rankData.points,
        newRank: isRankUp ? {
          id: rankData.current_rank_id as number,
          name: rankDetails.name,
          badge_color: rankDetails.badge_color
        } : undefined
      };
    } catch (err) {
      console.error('Error awarding points:', err);
      return {
        success: false,
        points: 0,
        error: "Σφάλμα κατά την απόδοση πόντων"
      };
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Award points for submitting a report (5 points)
   */
  const awardReportPoints = async (reportId: string) => {
    return awardPoints("report", 5, reportId);
  };

  /**
   * Award points for stray registration (1 point)
   */
  const awardStrayRegistrationPoints = async (strayId: string) => {
    return awardPoints("stray_registration", 1, strayId);
  };

  /**
   * Award points for stray activity (3 points)
   */
  const awardStrayActivityPoints = async (activityId: string) => {
    return awardPoints("stray_activity", 3, activityId);
  };

  /**
   * Award points for forum activity
   */
  const awardForumPoints = async (postId: string) => {
    return awardPoints("forum_post", 2, postId);
  };

  /**
   * Award points for comment activity
   */
  const awardCommentPoints = async (commentId: string) => {
    return awardPoints("forum_comment", 1, commentId);
  };

  /**
   * Convert activity type to human-readable text
   */
  const activityTypeToText = (activityType: string): string => {
    switch (activityType) {
      case "report":
        return "την αναφορά αδέσποτου";
      case "stray_registration":
        return "την καταχώρηση αδέσποτου";
      case "stray_activity":
        return "τη δραστηριότητα αδέσποτου";
      case "forum_post":
        return "τη δημοσίευση στο φόρουμ";
      case "forum_comment":
        return "το σχόλιο στο φόρουμ";
      default:
        return "τη δραστηριότητα";
    }
  };

  return {
    isProcessing,
    awardPoints,
    awardReportPoints,
    awardStrayRegistrationPoints,
    awardStrayActivityPoints,
    awardForumPoints,
    awardCommentPoints
  };
};
