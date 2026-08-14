import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Heart, PawPrint } from "lucide-react";

interface AdoptionStray {
  id: string;
  name: string;
  age: number | null;
  birth_year: number | null;
  image_url: string | null;
  image_urls: string[] | null;
  registered_by: string;
}

const ageLabel = (s: AdoptionStray) => {
  if (s.age) return `${s.age} ετών`;
  if (s.birth_year) {
    const a = new Date().getFullYear() - s.birth_year;
    return a > 0 ? `${a} ετών` : "Μωρό";
  }
  return "Άγνωστη ηλικία";
};

/** Public adoption showcase for the home page (visible to guests). */
const AdoptionsShowcase = () => {
  const { toast } = useToast();
  const [selected, setSelected] = useState<AdoptionStray | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const { data: strays = [] } = useQuery({
    queryKey: ["adoption-showcase"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("strays")
        .select("id, name, age, birth_year, image_url, image_urls, registered_by")
        .eq("available_for_adoption", true)
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return (data ?? []) as unknown as AdoptionStray[];
    },
  });

  const openDialog = (s: AdoptionStray) => {
    setSelected(s);
    setSent(false);
    setFullName("");
    setEmail("");
    setPhone("");
    setMessage("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      toast({ title: "Συμπληρώστε όλα τα πεδία", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.from("adoption_interests" as never).insert([
        {
          stray_id: selected.id,
          stray_name: selected.name,
          owner_id: selected.registered_by,
          full_name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          message: message.trim() || null,
        },
      ] as never);
      if (error) throw error;
      setSent(true);
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

  if (strays.length === 0) return null;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-bold">Υιοθεσίες</h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Αδέσποτα που αναζητούν οικογένεια. Δείξτε το ενδιαφέρον σας και θα επικοινωνήσουμε μαζί σας.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {strays.map((s) => {
            const img = s.image_url || s.image_urls?.[0];
            return (
              <Card key={s.id} className="overflow-hidden">
                {img ? (
                  <img src={img} alt={`Φωτογραφία του ${s.name}`} className="h-48 w-full object-cover" loading="lazy" />
                ) : (
                  <div className="flex h-48 w-full items-center justify-center bg-gray-100">
                    <PawPrint className="h-10 w-10 text-gray-400" />
                  </div>
                )}
                <CardContent className="space-y-3 p-4 text-center">
                  <h3 className="text-lg font-semibold">{s.name}</h3>
                  <p className="text-sm text-gray-600">{ageLabel(s)}</p>
                  <Button
                    onClick={() => openDialog(s)}
                    className="w-full bg-strays-orange hover:bg-strays-dark-orange"
                  >
                    <Heart className="mr-1 h-4 w-4" /> Ενδιαφέρομαι
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Ενδιαφέρον υιοθεσίας — {selected?.name}</DialogTitle>
          </DialogHeader>

          {sent ? (
            <p className="rounded-lg bg-green-50 p-4 text-green-700">
              Ευχαριστούμε! Το ενδιαφέρον σας στάλθηκε. Θα επικοινωνήσουμε μαζί σας σύντομα.
            </p>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <p className="rounded-lg bg-orange-50 p-3 text-sm text-gray-700">
                Οι υιοθεσίες γίνονται με όλα τα νόμιμα μέσα: υπογραφή συμφωνητικού υιοθεσίας,
                ταυτοποίηση στοιχείων, μεταβίβαση στο Εθνικό Μητρώο Ζώων Συντροφιάς και επικοινωνία
                παρακολούθησης μετά την υιοθεσία.
              </p>
              <div>
                <Label htmlFor="ai-name">Ονοματεπώνυμο</Label>
                <Input id="ai-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="ai-email">Email</Label>
                <Input id="ai-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="ai-phone">Κινητό</Label>
                <Input id="ai-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="ai-msg">Μήνυμα (προαιρετικό)</Label>
                <Textarea id="ai-msg" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
              </div>
              <Button type="submit" disabled={sending} className="w-full bg-strays-orange hover:bg-strays-dark-orange">
                {sending ? "Αποστολή..." : "Αποστολή"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default AdoptionsShowcase;
