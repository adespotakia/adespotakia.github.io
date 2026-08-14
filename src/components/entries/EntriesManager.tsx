import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReportLocationMap from "@/components/report/ReportLocationMap";
import { Pencil, Trash2 } from "lucide-react";

type SourceKey = "strays" | "reports" | "stray_activities" | "lost_strays" | "neighborhood_strays";

type FieldType = "text" | "textarea" | "number" | "boolean" | "date" | "select";

interface ExtraField {
  column: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
}

interface SourceDef {
  key: SourceKey;
  table: string;
  label: string;
  color: string;
  ownerColumn: string;
  titleField: string;
  descriptionField: string;
  addressField: string;
  latField: string;
  lngField: string;
  extras: ExtraField[];
}

const ANIMAL_OPTIONS = [
  { value: "dog", label: "Σκύλος" },
  { value: "cat", label: "Γάτα" },
  { value: "other", label: "Άλλο" },
];

const SOURCES: SourceDef[] = [
  {
    key: "neighborhood_strays",
    table: "neighborhood_strays",
    label: "Νέα αδέσποτα",
    color: "bg-blue-100 text-blue-800",
    ownerColumn: "user_id",
    titleField: "name",
    descriptionField: "description",
    addressField: "location_description",
    latField: "latitude",
    lngField: "longitude",
    extras: [
      { column: "registerer_name", label: "Καταχωρητής", type: "text" },
      { column: "animal_type", label: "Είδος", type: "select", options: ANIMAL_OPTIONS },
    ],
  },
  {
    key: "strays",
    table: "strays",
    label: "Μητρώο δεσποζόμενων",
    color: "bg-green-100 text-green-800",
    ownerColumn: "registered_by",
    titleField: "name",
    descriptionField: "story",
    addressField: "location_description",
    latField: "latitude",
    lngField: "longitude",
    extras: [
      { column: "registerer_username", label: "Καταχωρητής", type: "text" },
      { column: "animal_type", label: "Είδος", type: "select", options: ANIMAL_OPTIONS },
      {
        column: "gender",
        label: "Φύλο",
        type: "select",
        options: [
          { value: "male", label: "Αρσενικό" },
          { value: "female", label: "Θηλυκό" },
          { value: "unknown", label: "Άγνωστο" },
        ],
      },
      { column: "age", label: "Ηλικία (έτη)", type: "number" },
      { column: "birth_year", label: "Έτος γέννησης", type: "number" },
      { column: "birth_month", label: "Μήνας γέννησης", type: "number" },
      { column: "fur_colors", label: "Χρώματα τριχώματος", type: "text" },
      { column: "possible_relatives", label: "Πιθανοί συγγενείς", type: "text" },
      { column: "is_neutered", label: "Στειρωμένο", type: "boolean" },
      { column: "neutering_date", label: "Ημερομηνία στείρωσης", type: "date" },
      { column: "neutering_vet", label: "Κτηνίατρος στείρωσης", type: "text" },
      { column: "expenses_paid_by", label: "Έξοδα πληρώθηκαν από", type: "text" },
      { column: "available_for_adoption", label: "Διαθέσιμο για υιοθεσία", type: "boolean" },
    ],
  },
  {
    key: "stray_activities",
    table: "stray_activities",
    label: "Δράσεις",
    color: "bg-orange-100 text-orange-800",
    ownerColumn: "user_id",
    titleField: "activity_type",
    descriptionField: "activity_description",
    addressField: "location_description",
    latField: "location_lat",
    lngField: "location_lng",
    extras: [
      { column: "activity_date", label: "Ημερομηνία δράσης", type: "date" },
      { column: "notes", label: "Σημειώσεις", type: "textarea" },
      { column: "cost", label: "Κόστος (€)", type: "number" },
      { column: "quantity", label: "Ποσότητα", type: "number" },
      { column: "unit", label: "Μονάδα", type: "text" },
    ],
  },
  {
    key: "reports",
    table: "reports",
    label: "Αναφορές επειγόντων",
    color: "bg-red-100 text-red-800",
    ownerColumn: "user_id",
    titleField: "animal_type",
    descriptionField: "description",
    addressField: "location_description",
    latField: "location_lat",
    lngField: "location_lng",
    extras: [
      { column: "animal_type", label: "Είδος", type: "select", options: ANIMAL_OPTIONS },
      {
        column: "condition",
        label: "Κατάσταση",
        type: "select",
        options: [
          { value: "injured", label: "Τραυματισμένο" },
          { value: "sick", label: "Άρρωστο" },
          { value: "healthy", label: "Υγιές" },
          { value: "hungry", label: "Πεινασμένο" },
          { value: "lost", label: "Χαμένο" },
          { value: "unknown", label: "Δεν γνωρίζω" },
        ],
      },
    ],
  },
  {
    key: "lost_strays",
    table: "lost_strays",
    label: "Χαμένα",
    color: "bg-purple-100 text-purple-800",
    ownerColumn: "user_id",
    titleField: "name",
    descriptionField: "details",
    addressField: "locations",
    latField: "latitude",
    lngField: "longitude",
    extras: [
      { column: "registerer_name", label: "Καταχωρητής", type: "text" },
      { column: "animal_type", label: "Είδος", type: "select", options: ANIMAL_OPTIONS },
      { column: "phone", label: "Τηλέφωνο επικοινωνίας", type: "text" },
      { column: "is_urgent", label: "Επείγον", type: "boolean" },
    ],
  },
];

interface EntryRow {
  source: SourceDef;
  id: string;
  ownerId: string;
  title: string;
  description: string;
  address: string;
  lat: number | null;
  lng: number | null;
  createdAt: string;
  raw: Record<string, unknown>;
}

interface EntriesManagerProps {
  /** Limit to one member's entries; omit to show every member's entries (admin tool). */
  userId?: string;
}

const EntriesManager = ({ userId }: EntriesManagerProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | SourceKey>("all");
  const [editing, setEditing] = useState<EntryRow | null>(null);
  const [form, setForm] = useState({ title: "", description: "", address: "", lat: null as number | null, lng: null as number | null });
  const [extras, setExtras] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["entries-manager", userId ?? "all"],
    queryFn: async () => {
      const results = await Promise.all(
        SOURCES.map(async (source) => {
          let query = supabase
            .from(source.table as never)
            .select("*")
            .order("created_at", { ascending: false })
            .limit(200);
          if (userId) query = query.eq(source.ownerColumn, userId);
          const { data, error } = await query;
          if (error) {
            console.error(`Error loading ${source.table}:`, error);
            return [] as EntryRow[];
          }
          return ((data ?? []) as unknown as Record<string, unknown>[]).map((row) => ({
            source,
            id: String(row.id),
            ownerId: String(row[source.ownerColumn] ?? ""),
            title: String(row[source.titleField] ?? "—"),
            description: String(row[source.descriptionField] ?? ""),
            address: String(row[source.addressField] ?? ""),
            lat: (row[source.latField] as number | null) ?? null,
            lng: (row[source.lngField] as number | null) ?? null,
            createdAt: String(row.created_at ?? ""),
            raw: row,
          }));
        }),
      );
      return results
        .flat()
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    },
  });

  const visible = useMemo(
    () => (filter === "all" ? entries : entries.filter((e) => e.source.key === filter)),
    [entries, filter],
  );

  const openEdit = (entry: EntryRow) => {
    setEditing(entry);
    setForm({ title: entry.title, description: entry.description, address: entry.address, lat: entry.lat, lng: entry.lng });
    const initial: Record<string, unknown> = {};
    entry.source.extras.forEach((f) => {
      initial[f.column] = entry.raw[f.column] ?? (f.type === "boolean" ? false : "");
    });
    setExtras(initial);
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const s = editing.source;
      const payload: Record<string, unknown> = {
        [s.titleField]: form.title,
        [s.descriptionField]: form.description,
        [s.addressField]: form.address,
        [s.latField]: form.lat,
        [s.lngField]: form.lng,
      };
      s.extras.forEach((f) => {
        const value = extras[f.column];
        if (f.type === "boolean") payload[f.column] = !!value;
        else if (f.type === "number") payload[f.column] = value === "" || value == null ? null : Number(value);
        else payload[f.column] = value === "" ? null : value;
      });
      const { error } = await supabase
        .from(s.table as never)
        .update(payload as never)
        .eq("id", editing.id);
      if (error) throw error;
      toast({ title: "Η καταχώρηση ενημερώθηκε" });
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ["entries-manager"] });
    } catch (err) {
      toast({
        title: "Σφάλμα αποθήκευσης",
        description: err instanceof Error ? err.message : "Δοκιμάστε ξανά.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (entry: EntryRow) => {
    if (!window.confirm("Διαγραφή αυτής της καταχώρησης;")) return;
    const { error } = await supabase.from(entry.source.table as never).delete().eq("id", entry.id);
    if (error) {
      toast({ title: "Σφάλμα διαγραφής", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Η καταχώρηση διαγράφηκε" });
    queryClient.invalidateQueries({ queryKey: ["entries-manager"] });
  };

  const renderExtra = (field: ExtraField) => {
    const value = extras[field.column];
    const setValue = (v: unknown) => setExtras((prev) => ({ ...prev, [field.column]: v }));
    const id = `em-${field.column}`;

    if (field.type === "boolean") {
      return (
        <label key={field.column} className="flex items-center gap-2 text-sm">
          <Checkbox checked={!!value} onCheckedChange={(v) => setValue(!!v)} />
          {field.label}
        </label>
      );
    }
    if (field.type === "textarea") {
      return (
        <div key={field.column} className="sm:col-span-2">
          <Label htmlFor={id}>{field.label}</Label>
          <Textarea id={id} rows={3} value={String(value ?? "")} onChange={(e) => setValue(e.target.value)} />
        </div>
      );
    }
    if (field.type === "select") {
      return (
        <div key={field.column}>
          <Label>{field.label}</Label>
          <Select value={String(value ?? "")} onValueChange={setValue}>
            <SelectTrigger>
              <SelectValue placeholder="Επιλέξτε" />
            </SelectTrigger>
            <SelectContent>
              {(field.options ?? []).map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }
    return (
      <div key={field.column}>
        <Label htmlFor={id}>{field.label}</Label>
        <Input
          id={id}
          type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
          value={
            field.type === "date"
              ? String(value ?? "").slice(0, 10)
              : String(value ?? "")
          }
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={filter} onValueChange={(v) => setFilter(v as "all" | SourceKey)}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Όλες οι καταχωρήσεις" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Όλες οι καταχωρήσεις</SelectItem>
            {SOURCES.map((s) => (
              <SelectItem key={s.key} value={s.key}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-gray-500">{visible.length} καταχωρήσεις</span>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">Φόρτωση...</p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-gray-500">Δεν υπάρχουν καταχωρήσεις.</p>
      ) : (
        <div className="space-y-3">
          {visible.map((entry) => (
            <div
              key={`${entry.source.key}-${entry.id}`}
              className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <Badge className={entry.source.color}>{entry.source.label}</Badge>
                  <span className="font-medium">{entry.title}</span>
                  {entry.lat == null && (
                    <Badge variant="outline" className="text-amber-700">Χωρίς σημείο στον χάρτη</Badge>
                  )}
                </div>
                <p className="truncate text-sm text-gray-600">{entry.address || entry.description || "—"}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(entry)}>
                  <Pencil className="mr-1 h-4 w-4" /> Διόρθωση
                </Button>
                <Button size="sm" variant="destructive" onClick={() => remove(entry)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Διόρθωση καταχώρησης — {editing?.source.label}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="em-title">Τίτλος / Όνομα</Label>
              <Input id="em-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>

            {editing && editing.source.extras.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {editing.source.extras.map(renderExtra)}
              </div>
            )}

            <div>
              <Label htmlFor="em-address">Διεύθυνση τοποθεσίας</Label>
              <Input id="em-address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="em-desc">Περιγραφή</Label>
              <Textarea id="em-desc" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <Label>Σημείο στον χάρτη</Label>
              <ReportLocationMap
                location={form.lat != null && form.lng != null ? { lat: form.lat, lng: form.lng } : null}
                onLocationSelect={(loc) => setForm({ ...form, lat: loc.lat, lng: loc.lng })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Άκυρο
            </Button>
            <Button onClick={save} disabled={saving} className="bg-strays-orange hover:bg-strays-dark-orange">
              {saving ? "Αποθήκευση..." : "Αποθήκευση"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EntriesManager;
