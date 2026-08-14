
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ReporterInfoProps {
  reporterName: string;
  setReporterName: (name: string) => void;
  reporterContact: string;
  setReporterContact: (contact: string) => void;
}

const ReporterInfo = ({
  reporterName,
  setReporterName,
  reporterContact,
  setReporterContact
}: ReporterInfoProps) => {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('username, phone')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Update the state when profile data is loaded
  React.useEffect(() => {
    if (profile?.username && !reporterName) {
      setReporterName(profile.username);
    }
    if (profile?.phone && !reporterContact) {
      setReporterContact(profile.phone);
    }
  }, [profile, reporterName, reporterContact, setReporterName, setReporterContact]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reporterName">Αναφορά από *</Label>
        <Input
          id="reporterName"
          value={reporterName || profile?.username || ""}
          readOnly
          disabled
          className="bg-gray-100 cursor-not-allowed"
        />
        <p className="text-xs text-gray-500">
          Η αναφορά καταχωρείται με τον λογαριασμό σας και δεν μπορεί να αλλάξει.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reporterContact">Τηλέφωνο επικοινωνίας *</Label>
        <Input 
          id="reporterContact"
          value={reporterContact}
          onChange={(e) => setReporterContact(e.target.value)}
          placeholder="Εισάγετε το τηλέφωνό σας"
          required
        />
      </div>
    </div>
  );
};

export default ReporterInfo;
