import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import AddressAutocomplete from "@/components/common/AddressAutocomplete";
import { Mic, Square, Play, X, FileDown, Printer, Loader2 } from "lucide-react";

interface LostStrayReportFormProps {
  /** Location fine-tuned on the map (optional). */
  location?: { lat: number; lng: number } | null;
  onSuccess?: () => void;
}

const MAX_PHOTOS = 4;

const LostStrayReportForm = ({ location = null, onSuccess }: LostStrayReportFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [registererName, setRegistererName] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [animalType, setAnimalType] = useState("dog");
  const [locations, setLocations] = useState("");
  const [details, setDetails] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Voice note
  const [isRecording, setIsRecording] = useState(false);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  // Prefill from the signed-in member's profile.
  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from("profiles")
      .select("username, phone, first_name, last_name")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        const p = data as any;
        if (!p) return;
        const full = [p.first_name, p.last_name].filter(Boolean).join(" ");
        setRegistererName(full || p.username || "");
        if (p.phone) setPhone(p.phone);
      });
  }, [user?.id]);

  useEffect(() => {
    const urls = photos.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [photos]);

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    setPhotos((prev) => [...prev, ...Array.from(files)].slice(0, MAX_PHOTOS));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        setVoiceBlob(blob);
        setVoiceUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      recorderRef.current = recorder;
      setIsRecording(true);
    } catch {
      toast({
        title: "Δεν έχουμε πρόσβαση στο μικρόφωνο",
        description: "Επιτρέψτε την πρόσβαση για να ηχογραφήσετε το όνομα.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setIsRecording(false);
  };

  const uploadFile = async (file: Blob, ext: string) => {
    const path = `${user!.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("lost-strays").upload(path, file);
    if (error) throw error;
    return supabase.storage.from("lost-strays").getPublicUrl(path).data.publicUrl;
  };

  const posterData = () => ({
    name: name.trim(),
    animalType,
    locations,
    details,
    phone,
    registererName,
    photoUrls: previews,
  });

  const handleDownloadPdf = async () => {
    if (!name.trim()) {
      toast({ title: "Συμπληρώστε πρώτα το όνομα", variant: "destructive" });
      return;
    }
    setIsExporting(true);
    try {
      const [{ buildPosterCanvas }, { default: jsPDF }] = await Promise.all([
        import("@/lib/lostPoster"),
        import("jspdf"),
      ]);
      const canvas = await buildPosterCanvas(posterData());
      const img = canvas.toDataURL("image/jpeg", 0.92);
      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pageW / canvas.width, pageH / canvas.height);
      const w = canvas.width * ratio;
      const h = canvas.height * ratio;
      pdf.addImage(img, "JPEG", (pageW - w) / 2, (pageH - h) / 2, w, h);
      pdf.save(`xameno-${name.trim()}.pdf`);
    } catch (e) {
      toast({
        title: "Σφάλμα δημιουργίας PDF",
        description: e instanceof Error ? e.message : undefined,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  /** Sends the poster straight to the user's default printer. */
  const handlePrint = async () => {
    if (!name.trim()) {
      toast({ title: "Συμπληρώστε πρώτα το όνομα", variant: "destructive" });
      return;
    }
    setIsExporting(true);
    try {
      const { buildPosterCanvas } = await import("@/lib/lostPoster");
      const canvas = await buildPosterCanvas(posterData());
      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      const win = window.open("", "_blank", "width=900,height=1200");
      if (!win) {
        toast({
          title: "Ο περιηγητής μπλόκαρε το παράθυρο εκτύπωσης",
          description: "Επιτρέψτε τα αναδυόμενα παράθυρα και δοκιμάστε ξανά.",
          variant: "destructive",
        });
        return;
      }
      win.document.write(
        `<html><head><title>Αφίσα - ${name.trim()}</title>` +
          `<style>@page{size:A4;margin:0}html,body{margin:0;padding:0}img{width:100%;display:block}</style>` +
          `</head><body><img src="${dataUrl}" /></body></html>`,
      );
      win.document.close();
      const printNow = () => {
        win.focus();
        win.print();
      };
      const img = win.document.querySelector("img");
      if (img && !img.complete) img.addEventListener("load", printNow);
      else setTimeout(printNow, 300);
    } catch (e) {
      toast({
        title: "Σφάλμα εκτύπωσης",
        description: e instanceof Error ? e.message : undefined,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast({ title: "Πρέπει να είστε συνδεδεμένοι", variant: "destructive" });
      return;
    }
    if (!name.trim()) {
      toast({ title: "Συμπληρώστε το όνομα", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const imageUrls: string[] = [];
      for (const photo of photos.slice(0, MAX_PHOTOS)) {
        imageUrls.push(await uploadFile(photo, photo.name.split(".").pop() || "jpg"));
      }
      let uploadedVoice: string | null = null;
      if (voiceBlob) uploadedVoice = await uploadFile(voiceBlob, "webm");

      const { error } = await supabase.from("lost_strays" as never).insert([
        {
          user_id: user.id,
          registerer_name: registererName || "Μέλος",
          name: name.trim(),
          animal_type: animalType,
          locations: locations.trim() || null,
          details: details.trim() || null,
          phone: phone.trim() || null,
          is_urgent: isUrgent,
          image_url: imageUrls[0] ?? null,
          image_urls: imageUrls.length ? imageUrls : null,
          voice_url: uploadedVoice,
          latitude: location?.lat ?? null,
          longitude: location?.lng ?? null,
        },
      ] as never);
      if (error) throw error;

      toast({ title: "Καταχωρήθηκε", description: "Το χαμένο ζώο προστέθηκε στη βάση." });
      setName("");
      setDetails("");
      setLocations("");
      setPhotos([]);
      setVoiceBlob(null);
      setVoiceUrl(null);
      onSuccess?.();
    } catch (err) {
      toast({
        title: "Σφάλμα καταχώρησης",
        description: err instanceof Error ? err.message : "Δοκιμάστε ξανά.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-purple-300 bg-white p-4">
      <h3 className="text-lg font-semibold text-purple-700">Καταγραφή Χαμένου Ζώου</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Καταχωρητής</Label>
          <Input value={registererName} readOnly className="bg-gray-100" />
        </div>
        <div>
          <Label htmlFor="lost-phone">Κινητό επικοινωνίας</Label>
          <Input
            id="lost-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="69........"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="lost-name">Ακούει στο όνομα</Label>
        <Input
          id="lost-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="π.χ. Λούσι"
        />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {!isRecording ? (
            <Button type="button" variant="outline" size="sm" onClick={startRecording}>
              <Mic className="mr-1 h-4 w-4" /> Ηχογράφηση ονόματος (προαιρετικό)
            </Button>
          ) : (
            <Button type="button" variant="destructive" size="sm" onClick={stopRecording}>
              <Square className="mr-1 h-4 w-4" /> Διακοπή
            </Button>
          )}
          {voiceUrl && (
            <>
              <audio src={voiceUrl} controls className="h-8" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setVoiceBlob(null);
                  setVoiceUrl(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      <div>
        <Label>Είδος</Label>
        <div className="mt-1 flex gap-2">
          {[
            { v: "dog", l: "Σκύλος" },
            { v: "cat", l: "Γάτα" },
            { v: "other", l: "Άλλο" },
          ].map((o) => (
            <button
              key={o.v}
              type="button"
              onClick={() => setAnimalType(o.v)}
              className={`rounded-lg border px-3 py-1.5 text-sm ${
                animalType === o.v ? "border-purple-600 bg-purple-600 text-white" : "border-gray-300"
              }`}
            >
              {o.l}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Περιοχή / Διεύθυνση</Label>
        <AddressAutocomplete
          value={locations}
          onChange={setLocations}
          placeholder="Πληκτρολογήστε διεύθυνση στην Ξάνθη"
        />
      </div>

      <div>
        <Label htmlFor="lost-photos">Φωτογραφίες (έως {MAX_PHOTOS})</Label>
        <Input
          id="lost-photos"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => addPhotos(e.target.files)}
          disabled={photos.length >= MAX_PHOTOS}
        />
        {previews.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {previews.map((src, i) => (
              <div key={src} className="relative">
                <img src={src} alt={`Φωτογραφία ${i + 1}`} className="h-20 w-20 rounded-md object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute -right-1 -top-1 rounded-full bg-red-600 p-0.5 text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="lost-details">Περισσότερες λεπτομέρειες</Label>
        <Textarea
          id="lost-details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={4}
          placeholder="Χαρακτηριστικά, πότε χάθηκε, συμπεριφορά..."
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox id="lost-urgent" checked={isUrgent} onCheckedChange={(v) => setIsUrgent(!!v)} />
        <Label htmlFor="lost-urgent">Επείγον</Label>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Button type="button" variant="outline" onClick={handleDownloadPdf} disabled={isExporting}>
          {isExporting ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <FileDown className="mr-1 h-4 w-4" />}
          Λήψη αφίσας PDF
        </Button>
        <Button type="button" variant="outline" onClick={handlePrint} disabled={isExporting}>
          <Printer className="mr-1 h-4 w-4" /> Αποστολή για εκτύπωση
        </Button>
        <Button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700">
          {isSubmitting ? "Καταχώρηση..." : "Καταχώρηση"}
        </Button>
      </div>
    </form>
  );
};

export default LostStrayReportForm;
