
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
}

interface NewsCommentsProps {
  articleId: string;
}

const NewsComments = ({ articleId }: NewsCommentsProps) => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState("");

  // Different comments for each article
  const getCommentsForArticle = (id: string): Comment[] => {
    switch (id) {
      case "1":
        return [
          {
            id: "1-1",
            author: "Κατερίνα Δ.",
            content: "Αυτή η κατάσταση με τις φόλες πρέπει να σταματήσει. Χρειαζόμαστε περισσότερη προστασία για τα αδέσποτα.",
            date: "2025-05-03T09:15:00Z"
          },
          {
            id: "1-2",
            author: "Πέτρος Α.",
            content: "Ο Νταλάρας ήταν πολύ αγαπητός στη γειτονιά μας. Όποιος έχει πληροφορίες να μιλήσει.",
            date: "2025-05-03T11:30:00Z"
          }
        ];
      case "2":
        return [
          {
            id: "2-1",
            author: "Ελένη Μ.",
            content: "Φανταστικά τα παιδιά! Είναι σημαντικό να μαθαίνουν από μικρή ηλικία τη φροντίδα των ζώων.",
            date: "2025-05-16T14:20:00Z"
          },
          {
            id: "2-2",
            author: "Νίκος Κ.",
            content: "Μπράβο στους δασκάλους και τα παιδιά για την πρωτοβουλία!",
            date: "2025-05-16T16:45:00Z"
          }
        ];
      case "3":
        return [
          {
            id: "3-1",
            author: "Σοφία Τ.",
            content: "Τι υπέροχη ιστορία! Ο Φοίνικας είναι τυχερός που βρήκε τόσο καλή φροντίδα.",
            date: "2025-05-06T10:30:00Z"
          },
          {
            id: "3-2",
            author: "Γιώργος Λ.",
            content: "Εξαιρετικό πρόγραμμα! Τα παιδιά μαθαίνουν υπευθυνότητα και ενσυναίσθηση.",
            date: "2025-05-06T13:15:00Z"
          }
        ];
      case "4":
        return [
          {
            id: "4-1",
            author: "Δημήτρης Σ.",
            content: "Επιτέλους ένα σύγχρονο καταφύγιο! Θα βοηθήσει πολύ τα αδέσποτα της περιοχής.",
            date: "2024-01-09T08:45:00Z"
          },
          {
            id: "4-2",
            author: "Αννα Β.",
            content: "Πώς μπορούμε να γίνουμε εθελοντές; Θέλω να βοηθήσω!",
            date: "2024-01-09T12:20:00Z"
          }
        ];
      default:
        return [];
    }
  };

  const [comments, setComments] = useState<Comment[]>(getCommentsForArticle(articleId));

  const handleSubmitComment = () => {
    if (!isAuthenticated) {
      toast({
        title: "Απαιτείται σύνδεση",
        description: "Πρέπει να συνδεθείτε για να αφήσετε σχόλιο",
        variant: "destructive"
      });
      return;
    }

    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        author: "Εσείς", // In real app, this would come from user profile
        content: newComment.trim(),
        date: new Date().toISOString()
      };
      
      setComments([...comments, comment]);
      setNewComment("");
      
      toast({
        title: "Το σχόλιό σας δημοσιεύτηκε",
        description: "Ευχαριστούμε για τη συμμετοχή σας!",
      });
    }
  };

  const formatCommentDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Μόλις τώρα";
    if (diffInHours < 24) return `Πριν ${diffInHours} ώρες`;
    return date.toLocaleDateString('el-GR');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-strays-orange" />
        <h3 className="text-xl font-semibold">Σχόλια ({comments.length})</h3>
      </div>

      {/* Comment Form */}
      {isAuthenticated ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Γράψτε το σχόλιό σας..."
                className="min-h-[100px]"
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim()}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Δημοσίευση
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gray-50">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">Συνδεθείτε για να αφήσετε σχόλιο</p>
            <Button variant="outline">Σύνδεση</Button>
          </CardContent>
        </Card>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <Card key={comment.id}>
            <CardContent className="pt-4">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-sm bg-strays-orange text-white">
                    {comment.author.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{comment.author}</span>
                    <span className="text-xs text-gray-500">
                      {formatCommentDate(comment.date)}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {comments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Δεν υπάρχουν σχόλια ακόμα. Γίνετε οι πρώτοι που θα σχολιάσετε!</p>
        </div>
      )}
    </div>
  );
};

export default NewsComments;
