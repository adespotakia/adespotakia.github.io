import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus } from "lucide-react";
import type { NewsArticleRow } from "@/hooks/useNews";
import RichTextEditor from "./RichTextEditor";

const NewsManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [source, setSource] = useState("");
  const [publishedDate, setPublishedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["news-articles-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_articles")
        .select("*")
        .order("published_date", { ascending: false });
      if (error) throw error;
      return data as NewsArticleRow[];
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["news-articles"] });
    queryClient.invalidateQueries({ queryKey: ["news-articles-admin"] });
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("news_articles").insert({
        title: title.trim(),
        content: content.trim(),
        image: image.trim() || null,
        source: source.trim() || null,
        published_date: publishedDate,
        created_by: user?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Το άρθρο δημοσιεύτηκε" });
      setTitle("");
      setContent("");
      setImage("");
      setSource("");
      setPublishedDate(new Date().toISOString().slice(0, 10));
      invalidate();
    },
    onError: (e: unknown) => {
      toast({
        title: "Σφάλμα",
        description: e instanceof Error ? e.message : "Αποτυχία δημοσίευσης",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("news_articles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Το άρθρο διαγράφηκε" });
      invalidate();
    },
    onError: (e: unknown) => {
      toast({
        title: "Σφάλμα",
        description: e instanceof Error ? e.message : "Αποτυχία διαγραφής",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Συμπληρώστε τα πεδία",
        description: "Ο τίτλος και το περιεχόμενο είναι υποχρεωτικά.",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" /> Νέο Άρθρο
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="news-title">Τίτλος *</Label>
              <Input
                id="news-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Τίτλος άρθρου"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="news-content">Περιεχόμενο *</Label>
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Κείμενο άρθρου. Χρησιμοποιήστε τη γραμμή εργαλείων για έντονα, πλάγια, στοίχιση και εικόνες μέσα στο κείμενο."
              />
              <p className="text-xs text-gray-500">
                Πατήστε το εικονίδιο εικόνας για να προσθέσετε φωτογραφίες οπουδήποτε μέσα στο άρθρο.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="news-image">Σύνδεσμος εικόνας</Label>
                <Input
                  id="news-image"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="news-source">Πηγή</Label>
                <Input
                  id="news-source"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="π.χ. Δήμος Ξάνθης"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="news-date">Ημερομηνία</Label>
              <Input
                id="news-date"
                type="date"
                value={publishedDate}
                onChange={(e) => setPublishedDate(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-strays-orange hover:bg-strays-dark-orange"
            >
              {createMutation.isPending ? "Δημοσίευση..." : "Δημοσίευση"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Υπάρχοντα Άρθρα</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-gray-500">Φόρτωση...</p>
          ) : articles.length === 0 ? (
            <p className="text-sm text-gray-500">Δεν υπάρχουν άρθρα.</p>
          ) : (
            <ul className="divide-y">
              {articles.map((a) => (
                <li key={a.id} className="flex items-start justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="font-medium line-clamp-2">{a.title}</p>
                    <p className="text-xs text-gray-500">
                      {a.published_date}
                      {a.source ? ` · ${a.source}` : ""}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600 hover:text-red-700 shrink-0"
                    onClick={() => {
                      if (confirm("Διαγραφή αυτού του άρθρου;")) {
                        deleteMutation.mutate(a.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NewsManager;
