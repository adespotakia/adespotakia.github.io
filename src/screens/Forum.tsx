import { useState, useEffect } from "react";
import { useNavigate } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ForumThread } from "@/components/forum/ForumPostCard";
import ForumHeader from "@/components/forum/ForumHeader";
import ForumTabs from "@/components/forum/ForumTabs";
import ForumCategoryManager from "@/components/forum/ForumCategoryManager";
import { generateSecureFileName } from "@/utils/fileValidation";

const Forum = () => {
  const navigate = useNavigate();
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (activeTab !== "cats" && activeTab !== "dogs") {
      fetchThreads(activeTab);
    }
  }, [activeTab]);

  const fetchThreads = async (category: string = "all") => {
    try {
      console.log("Fetching threads for category:", category);
      let query = supabase.from('forum_threads').select('*').order('created_at', { ascending: false });
      
      if (category !== "all") {
        query = query.eq('category', category);
      }
      
      const { data: threadsData, error: threadsError } = await query;
      
      if (threadsError) {
        console.error("Error fetching threads:", threadsError);
        throw threadsError;
      }
      
      console.log("Fetched threads:", threadsData);
      
      if (threadsData && threadsData.length > 0) {
        const userIds = [...new Set(threadsData.map(thread => thread.user_id))];
        console.log("User IDs to fetch:", userIds);

        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', userIds);
          
        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
        }
        
        console.log("Fetched profiles:", profilesData);

        const profilesMap: Record<string, string> = {};
        if (profilesData) {
          profilesData.forEach(profile => {
            profilesMap[profile.id] = profile.username;
          });
        }
        
        const formattedThreads = threadsData.map((thread: any) => ({
          id: thread.id,
          title: thread.title,
          content: thread.content,
          category: thread.category,
          created_at: thread.created_at,
          user_id: thread.user_id,
          username: profilesMap[thread.user_id] || "Ανώνυμος",
          comment_count: 0,
          like_count: 0,
          image_urls: thread.image_urls || []
        }));
        
        console.log("Formatted threads:", formattedThreads);
        setThreads(formattedThreads);
      } else {
        setThreads([]);
      }
    } catch (error: any) {
      console.error("Error in fetchThreads:", error);
      toast({
        title: "Σφάλμα",
        description: "Δεν ήταν δυνατή η φόρτωση των συζητήσεων",
        variant: "destructive"
      });
      setThreads([]);
    }
  };

  const uploadThreadImages = async (images: File[]): Promise<string[]> => {
    const imageUrls: string[] = [];
    
    for (const image of images) {
      const fileName = generateSecureFileName(image.name, user!.id);
      
      console.log("Uploading thread image:", fileName);
      
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('thread-images')
        .upload(fileName, image, { 
          cacheControl: '3600',
          upsert: false 
        });

      if (uploadError) {
        console.error("Thread image upload error:", uploadError);
        throw new Error(`Σφάλμα μεταφόρτωσης εικόνας: ${uploadError.message}`);
      }

      if (uploadData) {
        const { data: urlData } = supabase.storage
          .from('thread-images')
          .getPublicUrl(uploadData.path);
        imageUrls.push(urlData.publicUrl);
        console.log("Thread image uploaded successfully:", urlData.publicUrl);
      }
    }
    
    return imageUrls;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      fetchThreads(activeTab);
      return;
    }
    const filtered = threads.filter(thread => 
      thread.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      thread.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filtered.length === 0) {
      toast({
        title: "Δεν βρέθηκαν αποτελέσματα",
        description: "Δοκιμάστε διαφορετικούς όρους αναζήτησης"
      });
    } else {
      setThreads(filtered);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchTerm("");
  };

  const handleNewPost = async (newThread: { title: string; content: string; category: string; images: File[]; }) => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Απαιτείται σύνδεση",
        description: "Πρέπει να συνδεθείτε για να δημιουργήσετε νέα συζήτηση",
        variant: "destructive"
      });
      return;
    }
    
    if (newThread.title.trim() === "" || newThread.content.trim() === "") {
      toast({
        title: "Συμπληρώστε όλα τα πεδία",
        description: "Τίτλος και περιεχόμενο είναι υποχρεωτικά",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      console.log("Creating new thread:", newThread, "User ID:", user.id);
      
      let imageUrls: string[] = [];
      if (newThread.images && newThread.images.length > 0) {
        console.log("Uploading thread images:", newThread.images.length);
        imageUrls = await uploadThreadImages(newThread.images);
      }

      const { data, error } = await supabase
        .from('forum_threads')
        .insert([{
          title: newThread.title,
          content: newThread.content,
          category: newThread.category,
          user_id: user.id,
          image_urls: imageUrls.length > 0 ? imageUrls : null
        }])
        .select();
        
      if (error) {
        console.error("Error creating thread:", error);
        throw error;
      }
      
      console.log("Thread created successfully:", data);
      toast({
        title: "Επιτυχία",
        description: "Η συζήτηση δημιουργήθηκε επιτυχώς"
      });

      fetchThreads(activeTab);
    } catch (error: any) {
      console.error("Error in handleNewPost:", error);
      toast({
        title: "Σφάλμα",
        description: error.message || "Σφάλμα κατά τη δημιουργία της συζήτησης",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = (threadId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Απαιτείται σύνδεση",
        description: "Πρέπει να συνδεθείτε για να προσθέσετε στα αγαπημένα",
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "Επιτυχία",
      description: "Προσθέσατε τη δημοσίευση στα αγαπημένα σας"
    });
  };

  const handleShare = (threadId: string) => {
    const shareUrl = `${window.location.origin}/forum/${threadId}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Συζήτηση από την Κοινότητα Αδέσποτων',
        url: shareUrl
      }).catch(err => {
        console.error('Error sharing', err);
      });
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast({
          title: "Κοινοποίηση",
          description: "Ο σύνδεσμος αντιγράφηκε στο πρόχειρο"
        });
      }, () => {
        toast({
          title: "Σφάλμα",
          description: "Δεν ήταν δυνατή η αντιγραφή του συνδέσμου",
          variant: "destructive"
        });
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Επιστροφή
        </Button>
      </div>
      
      <div className="flex justify-end mb-4">
        <ForumCategoryManager />
      </div>

      <ForumHeader
        activeTab={activeTab}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleSearch={handleSearch}
        isAuthenticated={isAuthenticated}
        onCreateThread={handleNewPost as never}
        isLoading={isLoading}
      />

      <ForumTabs
        threads={threads}
        onLike={handleLike}
        onShare={handleShare}
        onTabChange={handleTabChange}
        onDelete={() => fetchThreads(activeTab)}
      />
    </div>
  );
};

export default Forum;
