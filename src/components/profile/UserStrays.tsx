
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Eye, Download, Upload } from "lucide-react";
import EditStrayDialog from "@/components/stray/EditStrayDialog";
import StrayTimelineDialog from "@/components/stray/StrayTimelineDialog";

interface Stray {
  id: string;
  name: string;
  age: number | null;
  birth_year: number | null;
  gender: string | null;
  fur_colors: string | null;
  location_description: string | null;
  story: string | null;
  is_neutered: boolean;
  neutering_vet: string | null;
  neutering_date: string | null;
  possible_relatives: string | null;
  expenses_paid_by: string | null;
  available_for_adoption: boolean | null;
  created_at: string;
}

interface UserStraysProps {
  userId: string;
}

const UserStrays = ({ userId }: UserStraysProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [strays, setStrays] = useState<Stray[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [editingStray, setEditingStray] = useState<Stray | null>(null);
  const [viewingStrayId, setViewingStrayId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isOwner = user?.id === userId;

  const fetchStrays = async () => {
    try {
      const { data, error } = await supabase
        .from('strays')
        .select('*')
        .eq('registered_by', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStrays((data || []) as unknown as Stray[]);
    } catch (err) {
      console.error('Error fetching strays:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStrays();
  }, [userId]);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(strays, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `adespola-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Η εξαγωγή ολοκληρώθηκε", description: `${strays.length} καταχωρήσεις` });
  };

  const handleImport = async (file: File) => {
    setIsImporting(true);
    try {
      const parsed = JSON.parse(await file.text());
      if (!Array.isArray(parsed)) throw new Error("bad format");
      const rows = parsed.map((s: any) => {
        const { id, created_at, updated_at, registered_by, ...rest } = s;
        return { ...rest, registered_by: userId };
      });
      const { error } = await supabase.from('strays').insert(rows as any);
      if (error) throw error;
      toast({ title: "Η εισαγωγή ολοκληρώθηκε", description: `${rows.length} καταχωρήσεις προστέθηκαν` });
      await fetchStrays();
    } catch (err: any) {
      console.error('Import error:', err);
      toast({
        title: "Σφάλμα εισαγωγής",
        description: err?.message || "Μη έγκυρο αρχείο",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };


  const handleStrayUpdated = (updatedStray: Stray) => {
    setStrays(prev => prev.map(stray => 
      stray.id === updatedStray.id ? updatedStray : stray
    ));
    setEditingStray(null);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('el-GR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const calculateAge = (stray: Stray) => {
    if (stray.age !== null) {
      if (stray.age < 12) {
        return `${stray.age} μήνας/μήνες`;
      } else {
        const years = Math.floor(stray.age / 12);
        const months = stray.age % 12;
        if (months === 0) {
          return `${years} έτος/έτη`;
        } else {
          return `${years} έτος/έτη και ${months} μήνας/μήνες`;
        }
      }
    }
    
    if (stray.birth_year) {
      const currentYear = new Date().getFullYear();
      const ageInYears = currentYear - stray.birth_year;
      return `${ageInYears} έτος/έτη`;
    }
    
    return "Άγνωστη";
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-lg"></div>
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
          <Button variant="outline" size="sm" onClick={handleExport} disabled={strays.length === 0}>
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

      {strays.length > 0 ? (
        strays.map((stray) => (
          <Card key={stray.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{stray.name}</CardTitle>
                  <p className="text-sm text-gray-500">
                    Καταχωρήθηκε στις {formatDate(stray.created_at)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewingStrayId(stray.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ιστορικό
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingStray(stray)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Επεξεργασία
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Ηλικία:</span> {calculateAge(stray)}
                </div>
                <div>
                  <span className="font-medium">Χρώματα:</span> {stray.fur_colors || "Δεν αναφέρθηκαν"}
                </div>
                <div className="col-span-2">
                  <Badge variant={stray.is_neutered ? "default" : "secondary"}>
                    {stray.is_neutered ? "Στειρωμένος/η" : "Δεν είναι στειρωμένος/η"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <p className="text-center text-gray-500 py-8">
          Δεν έχετε καταχωρήσει κανέναν αδέσποτο ακόμη.
        </p>
      )}

      {editingStray && (
        <EditStrayDialog
          stray={editingStray as never}
          open={!!editingStray}
          onOpenChange={(open) => !open && setEditingStray(null)}
          onStrayUpdated={handleStrayUpdated as unknown as (stray: any) => void}
        />
      )}

      {viewingStrayId && (
        <StrayTimelineDialog
          strayId={viewingStrayId}
          isOpen={!!viewingStrayId}
          onClose={() => setViewingStrayId(null)}
        />
      )}
    </div>
  );
};

export default UserStrays;
