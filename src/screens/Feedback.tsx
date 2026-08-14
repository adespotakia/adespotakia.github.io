import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Bug } from "lucide-react";

const Feedback = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [kind, setKind] = useState<"idea" | "bug">("idea");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast({ title: "Πρέπει να είστε συνδεδεμένοι", variant: "destructive" });
      return;
    }
    if (!title.trim() || !message.trim()) {
      toast({ title: "Συμπληρώστε τίτλο και περιγραφή", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.from("feedback_submissions" as never).insert([
        {
          user_id: user.id,
          name: user.username ?? null,
          email: user.email ?? null,
          kind,
          title: title.trim(),
          message: message.trim(),
        },
      ] as never);
      if (error) throw error;
      setSent(true);
      setTitle("");
      setMessage("");
      toast({ title: "Ευχαριστούμε!", description: "Η πρότασή σας στάλθηκε στην ομάδα." });
    } catch (err) {
      toast({
        title: "Σφάλμα αποστολής",
        description: err instanceof Error ? err.message : "Δοκιμάστε ξανά.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Προτάσεις & Σφάλματα</CardTitle>
          <CardDescription>
            Στείλτε μας ιδέες βελτιστοποίησης ή αναφέρετε σφάλματα που εντοπίσατε στην πλατφόρμα.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent && (
            <p className="mb-4 rounded-lg bg-green-50 p-3 text-center text-green-700">
              Το μήνυμά σας καταχωρήθηκε. Ευχαριστούμε για τη βοήθεια!
            </p>
          )}
          <form onSubmit={submit} className="space-y-5">
            <div>
              <Label>Τύπος</Label>
              <div className="mt-1 flex gap-2">
                <button
                  type="button"
                  onClick={() => setKind("idea")}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                    kind === "idea" ? "border-strays-orange bg-orange-50 text-strays-orange" : "border-gray-300"
                  }`}
                >
                  <Lightbulb className="h-4 w-4" /> Ιδέα βελτίωσης
                </button>
                <button
                  type="button"
                  onClick={() => setKind("bug")}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                    kind === "bug" ? "border-red-600 bg-red-50 text-red-600" : "border-gray-300"
                  }`}
                >
                  <Bug className="h-4 w-4" /> Σφάλμα
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="fb-title">Τίτλος</Label>
              <Input id="fb-title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div>
              <Label htmlFor="fb-message">Περιγραφή</Label>
              <Textarea
                id="fb-message"
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Περιγράψτε την ιδέα ή το σφάλμα με όσο περισσότερες λεπτομέρειες μπορείτε..."
              />
            </div>

            <Button
              type="submit"
              disabled={sending}
              className="w-full bg-strays-orange hover:bg-strays-dark-orange"
            >
              {sending ? "Αποστολή..." : "Αποστολή"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Feedback;
