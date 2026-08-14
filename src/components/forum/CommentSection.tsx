
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  username?: string;
}

interface CommentSectionProps {
  threadId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ threadId }) => {
  const [newComment, setNewComment] = useState("");
  const { user, isAuthenticated } = useAuth();
  const { isModerator } = useUserRole();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', threadId],
    queryFn: async () => {
      const { data: commentsData, error } = await supabase
        .from('forum_comments')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (commentsData && commentsData.length > 0) {
        const userIds = [...new Set(commentsData.map(comment => comment.user_id))];
        
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', userIds);

        const profilesMap: Record<string, string> = {};
        if (profilesData) {
          profilesData.forEach(profile => {
            profilesMap[profile.id] = profile.username;
          });
        }

        return commentsData.map((comment: any) => ({
          ...comment,
          username: profilesMap[comment.user_id] || "Ανώνυμος"
        }));
      }

      return [];
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from('forum_comments')
        .insert([{
          thread_id: threadId,
          user_id: user.id,
          content
        }])
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', threadId] });
      setNewComment("");
      toast({
        title: "Επιτυχία",
        description: "Το σχόλιό σας προστέθηκε επιτυχώς"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Σφάλμα",
        description: error.message || "Σφάλμα κατά την προσθήκη του σχολίου",
        variant: "destructive"
      });
    }
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from("forum_comments")
        .delete()
        .eq("id", commentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", threadId] });
      toast({ title: "Επιτυχία", description: "Το σχόλιο διαγράφηκε." });
    },
    onError: (error: any) => {
      toast({
        title: "Σφάλμα",
        description: error.message || "Δεν ήταν δυνατή η διαγραφή.",
        variant: "destructive",
      });
    },
  });



  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    if (!isAuthenticated) {
      toast({
        title: "Απαιτείται σύνδεση",
        description: "Πρέπει να συνδεθείτε για να σχολιάσετε",
        variant: "destructive"
      });
      return;
    }

    addCommentMutation.mutate(newComment);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('el-GR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        <h3 className="text-lg font-semibold">
          Σχόλια ({comments?.length || 0})
        </h3>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4">Φόρτωση σχολίων...</div>
        ) : comments && comments.length > 0 ? (
          comments.map((comment) => (
            <Card key={comment.id} className="border-l-4 border-l-blue-200">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-blue-600">
                    {comment.username}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {formatDate(comment.created_at)}
                    </span>
                    {(isModerator || comment.user_id === user?.id) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-1 text-red-600 hover:text-red-800"
                        onClick={() => deleteCommentMutation.mutate(comment.id)}
                        disabled={deleteCommentMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {comment.content}
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            Δεν υπάρχουν σχόλια ακόμα. Γίνετε ο πρώτος που θα σχολιάσει!
          </div>
        )}
      </div>

      {/* Add Comment Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Γράψτε το σχόλιό σας..."
            rows={3}
            className="resize-none"
          />
          <Button 
            type="submit" 
            disabled={!newComment.trim() || addCommentMutation.isPending}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {addCommentMutation.isPending ? "Αποστολή..." : "Αποστολή σχολίου"}
          </Button>
        </form>
      ) : (
        <div className="text-center py-4 text-gray-500">
          Πρέπει να συνδεθείτε για να προσθέσετε σχόλιο
        </div>
      )}
    </div>
  );
};

export default CommentSection;
