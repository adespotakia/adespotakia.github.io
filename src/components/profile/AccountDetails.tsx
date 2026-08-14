
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProfileImageUpload from "./ProfileImageUpload";
import { sanitizeText } from "@/utils/inputSanitization";

const AccountDetails = () => {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
      
      // Set initial avatar URL
      if (data?.avatar_url) {
        setAvatarUrl(data.avatar_url);
      }
      
      return data;
    },
    enabled: !!user?.id,
  });

  const handleAvatarUpdate = (newUrl: string) => {
    setAvatarUrl(newUrl);
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <ProfileImageUpload 
          currentAvatarUrl={avatarUrl || profile?.avatar_url || undefined}
          onAvatarUpdate={handleAvatarUpdate}
        />
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Όνομα χρήστη</Label>
          <Input 
            id="username" 
            value={sanitizeText(profile?.username || '')} 
            readOnly 
            className="bg-gray-50"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            value={user.email || ''} 
            readOnly 
            className="bg-gray-50"
          />
        </div>
      </div>
    </div>
  );
};

export default AccountDetails;
