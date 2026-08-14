
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface StrayRegistererInfoProps {
  form: UseFormReturn<any>;
}

const StrayRegistererInfo = ({ form }: StrayRegistererInfoProps) => {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Set the registerer username when profile data is loaded
  React.useEffect(() => {
    if (profile?.username) {
      form.setValue("registererUsername", profile.username);
    }
  }, [profile, form]);

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="registererUsername"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Καταχωρήθηκε από</FormLabel>
            <FormControl>
              <Input 
                {...field} 
                value={profile?.username || ""}
                readOnly 
                className="bg-gray-50 cursor-not-allowed"
                placeholder="Φόρτωση ονόματος χρήστη..."
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};

export default StrayRegistererInfo;
