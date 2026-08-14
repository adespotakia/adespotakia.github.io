
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserRank from "@/components/user/UserRank";
import AccountDetails from "@/components/profile/AccountDetails";
import UserActivities from "@/components/profile/UserActivities";
import UserStats from "@/components/profile/UserStats";
import UserStrays from "@/components/profile/UserStrays";
import BioEditor from "@/components/profile/BioEditor";
import TeamBadges from "@/components/user/TeamBadges";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useUserRole } from "@/hooks/useUserRole";
import NewsManager from "@/components/news/NewsManager";
import EntriesManager from "@/components/entries/EntriesManager";
import AccessRequestsPanel from "@/components/admin/AccessRequestsPanel";
import AdoptionInterestsPanel from "@/components/admin/AdoptionInterestsPanel";

const ProfilePage = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();

  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const handleBioUpdate = (newBio: string) => {
    refetchProfile();
  };

  if (!user) return null;

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <h1 className="text-2xl font-bold mb-2">Το Προφίλ μου</h1>
      </div>
      
      <Tabs defaultValue="account" className="w-full">
        <TabsList className={`grid w-full ${isAdmin ? "grid-cols-7" : "grid-cols-5"}`}>
          <TabsTrigger value="account">Λογαριασμός</TabsTrigger>
          <TabsTrigger value="strays">Τα αδεσποτάκια μου</TabsTrigger>
          <TabsTrigger value="recent">Πρόσφατες δραστηριότητες</TabsTrigger>
          <TabsTrigger value="entries">Οι καταχωρήσεις μου</TabsTrigger>
          <TabsTrigger value="adoptions">Αιτήματα υιοθεσίας</TabsTrigger>
          {isAdmin && <TabsTrigger value="admin">Διαχείριση Νέων</TabsTrigger>}
          {isAdmin && <TabsTrigger value="admin-tools">Εργαλεία Διαχειριστή</TabsTrigger>}
        </TabsList>

        <TabsContent value="account">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Στοιχεία Λογαριασμού</CardTitle>
                  <CardDescription>
                    Προβολή και διαχείριση των στοιχείων του λογαριασμού σας
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <AccountDetails />
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Βιογραφικό</CardTitle>
                  <CardDescription>
                    Πείτε μας λίγα λόγια για εσάς
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BioEditor 
                    bio={profile?.bio || null} 
                    firstName={profile?.first_name || null}
                    lastName={profile?.last_name || null}
                    onBioUpdate={handleBioUpdate}
                  />
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Επίπεδο & Στατιστικά</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <TeamBadges userId={user.id} />
                  <div className="flex justify-center">
                    <UserRank size="lg" />
                  </div>
                  <UserStats userId={user.id} />
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Ειδοποιήσεις</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Δεν έχετε νέες ειδοποιήσεις.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="strays">
          <Card>
            <CardHeader>
              <CardTitle>Οι Καταχωρήσεις μου</CardTitle>
              <CardDescription>
                Διαχειριστείτε τους αδέσποτους που έχετε καταχωρήσει
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserStrays userId={user.id} />
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Πρόσφατες δραστηριότητες</CardTitle>
              <CardDescription>
                Οι δραστηριότητες φροντίδας που έχετε καταγράψει
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserActivities userId={user.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entries">
          <Card>
            <CardHeader>
              <CardTitle>Οι καταχωρήσεις μου</CardTitle>
              <CardDescription>
                Όλες οι καταχωρήσεις σας από κάθε φόρμα — διορθώστε στοιχεία ή το σημείο στον χάρτη
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EntriesManager userId={user.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adoptions">
          <Card>
            <CardHeader>
              <CardTitle>Αιτήματα υιοθεσίας</CardTitle>
              <CardDescription>
                Ενδιαφέρον υιοθεσίας για αδέσποτα που έχετε καταχωρήσει
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdoptionInterestsPanel ownerOnly ownerId={user.id} />
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="admin">
            <Card>
              <CardHeader>
                <CardTitle>Διαχείριση Νέων</CardTitle>
                <CardDescription>
                  Δημιουργήστε νέα άρθρα ή διαγράψτε υπάρχοντα που εμφανίζονται στην αρχική σελίδα
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NewsManager />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="admin-tools" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Διόρθωση καταχωρήσεων μελών</CardTitle>
                <CardDescription>
                  Όλες οι καταχωρήσεις της πλατφόρμας — διορθώστε στοιχεία ή θέση στον χάρτη
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EntriesManager />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Αιτήματα πρόσβασης νέων χρηστών</CardTitle>
                <CardDescription>Στοιχεία που έστειλαν επισκέπτες για δημιουργία λογαριασμού</CardDescription>
              </CardHeader>
              <CardContent>
                <AccessRequestsPanel />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Αιτήματα υιοθεσίας</CardTitle>
                <CardDescription>Ενδιαφέρον υιοθεσίας από την αρχική σελίδα</CardDescription>
              </CardHeader>
              <CardContent>
                <AdoptionInterestsPanel />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default ProfilePage;
