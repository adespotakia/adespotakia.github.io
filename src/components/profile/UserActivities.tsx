import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Upload, MapPin } from "lucide-react";

interface ActivityRow {
  id: string;
  activity_type: string;
  activity_description: string;
  notes: string | null;
  activity_date: string;
  created_at: string;
  location_description: string | null;
  location_lat: number | null;
  location_lng: number | null;
  stray_id: string;
  strays?: { name: string | null } | null;
}

interface UserActivitiesProps {
  userId: string;
}

const UserActivities = ({ userId }: UserActivitiesProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isOwner = user?.id === userId;

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from("stray_activities")
        .select("*, strays(name)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setActivities((data || []) as unknown as ActivityRow[]);
    } catch (err) {
      console.error("Error fetching activities:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchActivities();
  }, [userId]);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(activities, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `drastiriotites-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Η εξαγωγή ολοκληρώθηκε", description: `${activities.length} δραστηριότητες` });
  };

  const handleImport = async (file: File) => {
    setIsImporting(true);
    try {
      const parsed = JSON.parse(await file.text());
      if (!Array.isArray(parsed)) throw new Error("bad format");
      const rows = parsed
        .map((a: any) => ({
          stray_id: a.stray_id,
          activity_type: a.activity_type,
          activity_description: a.activity_description,
          notes: a.notes ?? null,
          activity_date: a.activity_date ?? new Date().toISOString().slice(0, 10),
          location_description: a.location_description ?? null,
          location_lat: a.location_lat ?? null,
          location_lng: a.location_lng ?? null,
          user_id: userId,
        }))
        .filter((a) => a.stray_id && a.activity_type && a.activity_description);

      if (rows.length === 0) throw new Error("empty");

      const { error } = await supabase.from("stray_activities").insert(rows);
      if (error) throw error;

      toast({ title: "Η εισαγωγή ολοκληρώθηκε", description: `${rows.length} δραστηριότητες` });
      await fetchActivities();
    } catch (err) {
      console.error(err);
      toast({
        title: "Σφάλμα εισαγωγής",
        description: "Το αρχείο δεν είναι έγκυρο ή δεν εισήχθη καμία δραστηριότητα.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat("el-GR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(dateStr));

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isOwner && (
        <div className="flex flex-wrap justify-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImport(f);
            }}
          />
          <Button variant="outline" size="sm" onClick={handleExport} disabled={activities.length === 0}>
            <Download className="h-4 w-4 mr-1" />
            Εξαγωγή αρχείου
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
          >
            <Upload className="h-4 w-4 mr-1" />
            {isImporting ? "Εισαγωγή..." : "Εισαγωγή αρχείου"}
          </Button>
        </div>
      )}

      {activities.length > 0 ? (
        activities.map((activity) => (
          <Card key={activity.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start gap-3">
                <CardTitle className="text-base">
                  {activity.strays?.name || "Αδέσποτο"}
                </CardTitle>
                <Badge variant="secondary">{activity.activity_type}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{formatDate(activity.activity_date)}</p>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>{activity.activity_description}</p>
              {activity.notes && <p className="text-muted-foreground">{activity.notes}</p>}
              {activity.location_description && (
                <p className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {activity.location_description}
                </p>
              )}
            </CardContent>
          </Card>
        ))
      ) : (
        <p className="text-center text-muted-foreground py-8">
          Δεν υπάρχουν καταγεγραμμένες δραστηριότητες ακόμη.
        </p>
      )}
    </div>
  );
};

export default UserActivities;
