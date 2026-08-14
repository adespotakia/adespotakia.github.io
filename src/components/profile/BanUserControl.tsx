import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Ban, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BanUserControlProps {
  userId: string;
}

const BanUserControl = ({ userId }: BanUserControlProps) => {
  const { user } = useAuth();
  const { isModerator } = useUserRole();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  const { data: banInfo } = useQuery({
    queryKey: ["ban-status", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("is_banned, ban_reason")
        .eq("id", userId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId && isModerator,
  });

  const banMutation = useMutation({
    mutationFn: async (ban: boolean) => {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_banned: ban,
          ban_reason: ban ? reason || null : null,
          banned_at: ban ? new Date().toISOString() : null,
          banned_by: ban ? user?.id ?? null : null,
        })
        .eq("id", userId);
      if (error) throw error;
      return ban;
    },
    onSuccess: (ban) => {
      queryClient.invalidateQueries({ queryKey: ["ban-status", userId] });
      setOpen(false);
      setReason("");
      toast({
        title: ban ? "Ο χρήστης αποκλείστηκε" : "Ο αποκλεισμός αφαιρέθηκε",
        description: ban
          ? "Ο χρήστης δεν μπορεί πλέον να δημοσιεύει στην πλατφόρμα."
          : "Ο χρήστης μπορεί ξανά να δημοσιεύει.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Σφάλμα",
        description: error.message || "Δεν ήταν δυνατή η ενημέρωση του αποκλεισμού.",
        variant: "destructive",
      });
    },
  });

  // Don't allow moderators to ban themselves
  if (!isModerator || userId === user?.id) return null;

  const isBanned = banInfo?.is_banned;

  return (
    <div className="flex items-center gap-2">
      {isBanned ? (
        <>
          <Badge variant="destructive">Αποκλεισμένος</Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => banMutation.mutate(false)}
            disabled={banMutation.isPending}
          >
            <ShieldCheck className="mr-1 h-4 w-4" /> Άρση αποκλεισμού
          </Button>
        </>
      ) : (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setOpen(true)}
        >
          <Ban className="mr-1 h-4 w-4" /> Αποκλεισμός χρήστη
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Αποκλεισμός χρήστη</DialogTitle>
            <DialogDescription>
              Ο χρήστης δεν θα μπορεί να δημιουργεί συζητήσεις ή σχόλια στην πλατφόρμα Adespolis.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Λόγος αποκλεισμού (προαιρετικό)..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Ακύρωση
            </Button>
            <Button
              variant="destructive"
              onClick={() => banMutation.mutate(true)}
              disabled={banMutation.isPending}
            >
              {banMutation.isPending ? "Αποθήκευση..." : "Αποκλεισμός"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BanUserControl;
