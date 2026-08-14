
import React from "react";
import { useParams, useNavigate } from "@/lib/router-compat";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import CommentSection from "@/components/forum/CommentSection";

const ForumThread = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();

  const { data: thread, isLoading } = useQuery({
    queryKey: ['thread', threadId],
    queryFn: async () => {
      if (!threadId) throw new Error("Thread ID is required");
      
      const { data: threadData, error } = await supabase
        .from('forum_threads')
        .select('*')
        .eq('id', threadId)
        .single();

      if (error) throw error;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', threadData.user_id)
        .single();

      return {
        ...threadData,
        username: profileData?.username || "Ανώνυμος"
      };
    },
    enabled: !!threadId,
  });

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('el-GR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'general':
        return { label: 'Γενικά', color: 'bg-blue-100 text-blue-800' };
      case 'help':
        return { label: 'Βοήθεια', color: 'bg-red-100 text-red-800' };
      case 'suggestions':
        return { label: 'Προτάσεις', color: 'bg-green-100 text-green-800' };
      default:
        return { label: category, color: 'bg-gray-100 text-gray-800' };
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Φόρτωση...</div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Η συζήτηση δεν βρέθηκε</div>
      </div>
    );
  }

  const category = getCategoryLabel(thread.category);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Επιστροφή
      </Button>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{thread.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>από {thread.username}</span>
                <span>•</span>
                <span>{formatDate(thread.created_at)}</span>
              </div>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${category.color}`}>
              {category.label}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {thread.content}
            </p>
          </div>
        </CardContent>
      </Card>

      <CommentSection threadId={thread.id} />
    </div>
  );
};

export default ForumThread;
