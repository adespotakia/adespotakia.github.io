
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProfileImageUpload from "./ProfileImageUpload";
import UserStats from "./UserStats";
import TeamBadges from "@/components/user/TeamBadges";
import UserStrays from "./UserStrays";
import UserActivities from "./UserActivities";
import BanUserControl from "./BanUserControl";

interface UserProfileModalProps {
  userId: string;
  onClose: () => void;
}

const UserProfileModal = ({ userId, onClose }: UserProfileModalProps) => {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Φόρτωση προφίλ...</DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-24 w-24 bg-gray-200 rounded-full mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!profile) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Σφάλμα</DialogTitle>
          </DialogHeader>
          <p>Δεν ήταν δυνατή η φόρτωση του προφίλ.</p>
          <Button onClick={onClose}>Κλείσιμο</Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Προφίλ Χρήστη
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="h-24 w-24 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-2xl text-gray-600">
                      {profile.username?.charAt(0).toUpperCase() || "?"}
                    </span>
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <CardTitle className="text-2xl">{profile.username}</CardTitle>
                  <TeamBadges userId={userId} />
                  {profile.bio && (
                    <p className="text-gray-600 mt-2">{profile.bio}</p>
                  )}
                  <div className="mt-3">
                    <BanUserControl userId={userId} />
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Stats */}
          <UserStats userId={userId} />

          {/* Activity and Strays */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Οι δραστηριότητες του {profile.username || "χρήστη"}</CardTitle>
              </CardHeader>
              <CardContent>
                <UserActivities userId={userId} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Τα αδεσποτάκια του {profile.username || "χρήστη"}</CardTitle>
              </CardHeader>
              <CardContent>
                <UserStrays userId={userId} />
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal;
