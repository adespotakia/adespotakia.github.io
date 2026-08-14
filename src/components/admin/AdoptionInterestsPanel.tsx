import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Trash2 } from "lucide-react";

interface AdoptionInterest {
  id: string;
  stray_name: string | null;
  full_name: string;
  email: string;
  phone: string;
  message: string | null;
  status: string;
  created_at: string;
}

interface AdoptionInterestsPanelProps {
  /** Admin sees every request; a member sees only requests for their own strays. */
  ownerOnly?: boolean;
  ownerId?: string;
}

const AdoptionInterestsPanel = ({ ownerOnly = false, ownerId }: AdoptionInterestsPanelProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: interests = [], isLoading } = useQuery({
    queryKey: ["adoption-interests", ownerOnly ? ownerId : "all"],
    queryFn: async () => {
      let query = supabase
        .from("adoption_interests" as never)
        .select("*")
        .order("created_at", { ascending: false });
      if (ownerOnly && ownerId) query = query.eq("owner_id", ownerId);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as AdoptionInterest[];
    },
    enabled: !ownerOnly || !!ownerId,
  });

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("adoption_interests" as never)
      .update({ status } as never)
      .eq("id", id);
    if (error) {
      toast({ title: "Σφάλμα", description: error.message, variant: "destructive" });
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["adoption-interests"] });
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("adoption_interests" as never).delete().eq("id", id);
    if (error) {
      toast({ title: "Σφάλμα", description: error.message, variant: "destructive" });
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["adoption-interests"] });
  };

  if (isLoading) return <p className="text-sm text-gray-500">Φόρτωση...</p>;
  if (interests.length === 0) return <p className="text-sm text-gray-500">Δεν υπάρχουν αιτήματα υιοθεσίας.</p>;

  return (
    <div className="space-y-3">
      {interests.map((i) => (
        <div key={i.id} className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{i.full_name}</span>
              <Badge variant="outline">{i.stray_name ?? "Άγνωστο αδέσποτο"}</Badge>
              <Badge variant={i.status === "new" ? "secondary" : "outline"}>
                {i.status === "new" ? "Νέο" : "Απαντήθηκε"}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">
              {i.email} · {i.phone}
            </p>
            {i.message && <p className="mt-1 text-sm text-gray-500">{i.message}</p>}
          </div>
          {!ownerOnly && (
            <div className="flex gap-2">
              {i.status === "new" && (
                <Button size="sm" variant="outline" onClick={() => setStatus(i.id, "handled")}>
                  <Check className="mr-1 h-4 w-4" /> Απαντήθηκε
                </Button>
              )}
              <Button size="sm" variant="destructive" onClick={() => remove(i.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AdoptionInterestsPanel;
