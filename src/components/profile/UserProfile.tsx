
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import AccountDetails from "./AccountDetails";
import PhoneVerification from "./PhoneVerification";
import ProfileImageUpload from "./ProfileImageUpload";
import BioEditor from "./BioEditor";
import UserStats from "./UserStats";
import UserActivities from "./UserActivities";
import UserStrays from "./UserStrays";
import TeamBadges from "@/components/user/TeamBadges";
import AdminRoute from "@/components/auth/AdminRoute";
import { Badge } from "@/components/ui/badge";
import { sanitizeText } from "@/utils/inputSanitization";

const UserProfile = () => {
  const { user } = useAuth();
  const { userRole, isAdmin } = useUserRole();
  const [activeTab, setActiveTab] = useState("account");
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
      return data;
    },
    enabled: !!user?.id,
  });

  const handleAvatarUpdate = (newUrl: string) => {
    setAvatarUrl(newUrl);
    refetchProfile();
  };

  const handleBioUpdate = (newBio: string) => {
    refetchProfile();
  };

  if (!user) {
    return (
      <div className="text-center">
        <p className="text-gray-600">Πρέπει να συνδεθείτε για να δείτε το προφίλ σας.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <ProfileImageUpload 
              currentAvatarUrl={profile?.avatar_url || avatarUrl}
              onAvatarUpdate={handleAvatarUpdate}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl">{sanitizeText(user.username || '')}</CardTitle>
                {userRole && userRole !== 'user' && (
                  <Badge variant={userRole === 'admin' ? 'destructive' : 'secondary'}>
                    {userRole === 'admin' ? 'Διαχειριστής' : userRole === 'supervisor' ? 'Επόπτης' : 'Συντονιστής'}
                  </Badge>
                )}
              </div>
              <p className="text-gray-600">{user.email}</p>
              <TeamBadges userId={user.id} />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats and Ranking */}
      <UserStats userId={user.id} />

      {/* Profile Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-5' : 'grid-cols-4'}`}>
          <TabsTrigger value="account">Λογαριασμός</TabsTrigger>
          <TabsTrigger value="recent">Πρόσφατες δραστηριότητες</TabsTrigger>
          <TabsTrigger value="strays">Τα αδεσποτάκια μου</TabsTrigger>
          <TabsTrigger value="profile">Προφίλ</TabsTrigger>
          {isAdmin && <TabsTrigger value="admin">Διαχείριση</TabsTrigger>}
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          <AccountDetails />
          <PhoneVerification isVerified={user.phoneVerified || false} />
        </TabsContent>


        <TabsContent value="recent">
          <UserActivities userId={user.id} />
        </TabsContent>

        <TabsContent value="strays">
          <UserStrays userId={user.id} />
        </TabsContent>

        <TabsContent value="profile">
          <BioEditor 
            bio={profile?.bio || null}
            firstName={profile?.first_name || null}
            lastName={profile?.last_name || null}
            onBioUpdate={handleBioUpdate}
          />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="admin">
            <AdminRoute>
              <Card>
                <CardHeader>
                  <CardTitle>Εργαλεία Διαχειριστή</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Εργαλεία διαχείρισης συστήματος θα προστεθούν σύντομα.
                  </p>
                </CardContent>
              </Card>
            </AdminRoute>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default UserProfile;
