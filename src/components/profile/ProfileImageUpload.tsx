
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ProfileImageUploadProps {
  currentAvatarUrl?: string;
  onAvatarUpdate: (newUrl: string) => void;
}

const ProfileImageUpload = ({ currentAvatarUrl, onAvatarUpdate }: ProfileImageUploadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = (file: File): boolean => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Σφάλμα αρχείου",
        description: "Επιτρέπονται μόνο εικόνες (JPG, PNG, WebP, GIF)",
        variant: "destructive",
      });
      return false;
    }

    if (file.size > maxSize) {
      toast({
        title: "Σφάλμα αρχείου",
        description: "Το μέγεθος του αρχείου δεν μπορεί να ξεπερνά τα 5MB",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user) return;
    
    const file = e.target.files[0];
    
    if (!validateFile(file)) {
      return;
    }

    setIsUploading(true);
    
    try {
      // Generate secure filename
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2);
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      const fileName = `${user.id}/${timestamp}_${random}.${extension}`;
      
      console.log("Uploading avatar:", fileName);
      
      // Upload to avatars bucket with proper options
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { 
          cacheControl: '3600',
          upsert: false 
        });

      if (uploadError) {
        console.error("Avatar upload error:", uploadError);
        throw new Error(`Σφάλμα μεταφόρτωσης: ${uploadError.message}`);
      }

      // Create a long-lived signed URL (bucket is private)
      const { data: urlData, error: urlError } = await supabase.storage
        .from('avatars')
        .createSignedUrl(data.path, 60 * 60 * 24 * 365 * 10);

      if (urlError || !urlData) {
        throw new Error(`Σφάλμα δημιουργίας συνδέσμου: ${urlError?.message}`);
      }

      const newAvatarUrl = urlData.signedUrl;
      console.log("Avatar uploaded successfully:", newAvatarUrl);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: newAvatarUrl })
        .eq('id', user.id);

      if (updateError) {
        console.error("Profile update error:", updateError);
        throw new Error(`Σφάλμα ενημέρωσης προφίλ: ${updateError.message}`);
      }

      onAvatarUpdate(newAvatarUrl);
      
      toast({
        title: "Επιτυχία!",
        description: "Η φωτογραφία προφίλ ενημερώθηκε",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Σφάλμα",
        description: error instanceof Error ? error.message : "Αδυναμία ενημέρωσης φωτογραφίας προφίλ",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Clear the input
      e.target.value = '';
    }
  };

  const getUserInitials = () => {
    if (!user?.email) return "?";
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage src={currentAvatarUrl} alt="Profile" />
          <AvatarFallback className="text-2xl">
            {getUserInitials()}
          </AvatarFallback>
        </Avatar>
        <label
          htmlFor="avatar-upload"
          className="absolute bottom-0 right-0 bg-strays-orange text-white rounded-full p-2 cursor-pointer hover:bg-orange-600 transition-colors"
        >
          <Camera className="h-4 w-4" />
        </label>
        <Input
          id="avatar-upload"
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.gif"
          className="hidden"
          onChange={handleImageUpload}
          disabled={isUploading}
        />
      </div>
      {isUploading && (
        <p className="text-sm text-gray-500">Μεταφόρτωση...</p>
      )}
    </div>
  );
};

export default ProfileImageUpload;
