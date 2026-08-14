import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Trash2 } from "lucide-react";

interface AccessRequest {
  id: string;
  username: string;
  email: string;
  phone: string;
  contact_app: string;
  status: string;
  created_at: string;
}

const AccessRequestsPanel = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["access-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("access_requests" as never)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as AccessRequest[];
    },
  });

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("access_requests" as never)
      .update({ status } as never)
      .eq("id", id);
    if (error) {
      toast({ title: "Σφάλμα", description: error.message, variant: "destructive" });
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["access-requests"] });
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("access_requests" as never).delete().eq("id", id);
    if (error) {
      toast({ title: "Σφάλμα", description: error.message, variant: "destructive" });
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["access-requests"] });
  };

  if (isLoading) return <p className="text-sm text-gray-500">Φόρτωση...</p>;
  if (requests.length === 0) return <p className="text-sm text-gray-500">Δεν υπάρχουν αιτήματα πρόσβασης.</p>;

  return (
    <div className="space-y-3">
      {requests.map((r) => (
        <div key={r.id} className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{r.username}</span>
              <Badge variant={r.status === "pending" ? "secondary" : "outline"}>
                {r.status === "pending" ? "Σε αναμονή" : "Ολοκληρώθηκε"}
              </Badge>
              {r.contact_app !== "none" && <Badge variant="outline">{r.contact_app}</Badge>}
            </div>
            <p className="text-sm text-gray-600">
              {r.email} · {r.phone}
            </p>
          </div>
          <div className="flex gap-2">
            {r.status === "pending" && (
              <Button size="sm" variant="outline" onClick={() => setStatus(r.id, "handled")}>
                <Check className="mr-1 h-4 w-4" /> Ολοκληρώθηκε
              </Button>
            )}
            <Button size="sm" variant="destructive" onClick={() => remove(r.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AccessRequestsPanel;
