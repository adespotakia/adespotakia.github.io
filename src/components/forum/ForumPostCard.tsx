
import React, { useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Heart, Share, Trash2, Pencil } from "lucide-react";
import UserProfileModal from "@/components/profile/UserProfileModal";
import EditThreadDialog from "@/components/forum/EditThreadDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";

export interface ForumThread {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  user_id: string;
  username?: string;
  comment_count?: number;
  like_count?: number;
  image_urls?: string[];
}

interface ForumPostCardProps {
  thread: ForumThread;
  onLike: (threadId: string) => void;
  onShare: (threadId: string) => void;
  onDelete?: (threadId: string) => void;
}

export const ForumPostCard: React.FC<ForumPostCardProps> = ({ thread, onLike, onShare, onDelete }) => {
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const { user } = useAuth();
  const { isModerator } = useUserRole();
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      return new Date(dateString).toLocaleDateString('el-GR', options);
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

  const category = getCategoryLabel(thread.category);

  const handleReadMore = () => {
    navigate(`/forum/thread/${thread.id}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το θέμα;')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('forum_threads')
        .delete()
        .eq('id', thread.id);

      if (error) throw error;
      
      if (onDelete) {
        onDelete(thread.id);
      }
    } catch (error) {
      console.error('Error deleting thread:', error);
      alert('Σφάλμα κατά τη διαγραφή του θέματος');
    }
  };

  // Owner can edit/delete their own thread; moderators (admin & supervisor) can moderate any thread
  const isOwner = user && user.id === thread.user_id;
  const canModerate = isModerator || isOwner;

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{thread.title}</CardTitle>
              <CardDescription>
                <span>
                  από{" "}
                  <button 
                    onClick={() => setShowUserProfile(true)}
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                  >
                    {thread.username}
                  </button>
                  {" "}• {formatDate(thread.created_at)}
                </span>
              </CardDescription>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${category.color}`}>
              {category.label}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-4">
            {thread.content.length > 200 
              ? `${thread.content.substring(0, 200)}...` 
              : thread.content}
          </p>
          {thread.image_urls && thread.image_urls.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
              {thread.image_urls.slice(0, 3).map((imageUrl, index) => (
                <img
                  key={index}
                  src={imageUrl}
                  alt={`Εικόνα ${index + 1}`}
                  className="w-full h-24 object-cover rounded-md"
                />
              ))}
              {thread.image_urls.length > 3 && (
                <div className="w-full h-24 bg-gray-200 rounded-md flex items-center justify-center text-gray-600 text-sm">
                  +{thread.image_urls.length - 3} ακόμα
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex space-x-4">
            <Button variant="ghost" size="sm" className="flex items-center text-gray-600">
              <MessageSquare className="mr-1 h-4 w-4" /> {thread.comment_count || 0}
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center text-gray-600" onClick={() => onLike(thread.id)}>
              <Heart className="mr-1 h-4 w-4" /> {thread.like_count || 0}
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center text-gray-600" onClick={() => onShare(thread.id)}>
              <Share className="mr-1 h-4 w-4" /> Κοινοποίηση
            </Button>
            {canModerate && (
              <>
                <Button variant="ghost" size="sm" className="flex items-center text-gray-600 hover:text-gray-900" onClick={() => setShowEdit(true)}>
                  <Pencil className="mr-1 h-4 w-4" /> Επεξεργασία
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center text-red-600 hover:text-red-800" onClick={handleDelete}>
                  <Trash2 className="mr-1 h-4 w-4" /> Διαγραφή
                </Button>
              </>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={handleReadMore}>
            Ανάγνωση
          </Button>
        </CardFooter>
      </Card>

      {showUserProfile && thread.user_id && (
        <UserProfileModal 
          userId={thread.user_id}
          onClose={() => setShowUserProfile(false)}
        />
      )}

      {showEdit && (
        <EditThreadDialog
          open={showEdit}
          onOpenChange={setShowEdit}
          thread={{ id: thread.id, title: thread.title, content: thread.content, category: thread.category }}
          onUpdated={() => onDelete?.(thread.id)}
        />
      )}
    </>
  );
};
