import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

/** Public form: visitors send their details to the admin to get access. */
const AccessRequestForm = () => {
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [whatsapp, setWhatsapp] = useState(false);
  const [viber, setViber] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !phone.trim() || !password || !confirmPassword) {
      toast({ title: "Συμπληρώστε όλα τα πεδία", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Οι κωδικοί δεν ταιριάζουν", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const apps = [whatsapp ? "whatsapp" : null, viber ? "viber" : null].filter(Boolean);
      const { error } = await supabase.from("access_requests" as never).insert([
        {
          username: username.trim(),
          email: email.trim(),
          phone: phone.trim(),
          temp_password: password,
          contact_app: apps.length ? apps.join(",") : "none",
        },
      ] as never);
      if (error) throw error;
      setSent(true);
      toast({
        title: "Το αίτημα στάλθηκε",
        description: "Ο διαχειριστής θα επικοινωνήσει μαζί σας.",
      });
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

  if (sent) {
    return (
      <p className="rounded-lg bg-green-50 p-4 text-center text-green-700">
        Ευχαριστούμε! Τα στοιχεία σας στάλθηκαν στον διαχειριστή.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 text-left">
      <div>
        <Label htmlFor="ar-username">Όνομα χρήστη</Label>
        <Input id="ar-username" value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="ar-email">Email</Label>
        <Input id="ar-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="ar-phone">Κινητό</Label>
        <Input id="ar-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="69........" />
      </div>
      <div>
        <Label htmlFor="ar-password">Προσωρινός κωδικός</Label>
        <Input
          id="ar-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Πληκτρολογήστε προσωρινό κωδικό"
        />
      </div>
      <div>
        <Label htmlFor="ar-password-confirm">Επιβεβαίωση κωδικού</Label>
        <Input
          id="ar-password-confirm"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Επαναλάβετε τον κωδικό"
        />
        {confirmPassword && password !== confirmPassword && (
          <p className="mt-1 text-sm text-red-600">Οι κωδικοί δεν ταιριάζουν</p>
        )}
      </div>
      <p className="rounded-md bg-orange-50 p-3 text-sm text-gray-700">
        Αν το κινητό είναι και Viber ή WhatsApp, επιλέξτε το αντίστοιχο checkbox.
      </p>
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={whatsapp} onCheckedChange={(v) => setWhatsapp(!!v)} /> WhatsApp
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={viber} onCheckedChange={(v) => setViber(!!v)} /> Viber
        </label>
      </div>
      <Button type="submit" disabled={sending} className="w-full bg-strays-orange hover:bg-strays-dark-orange">
        {sending ? "Αποστολή..." : "Αποστολή στοιχείων στον διαχειριστή"}
      </Button>
    </form>
  );
};

export default AccessRequestForm;
