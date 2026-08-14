
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, Clock, XCircle } from "lucide-react";

interface AddressVerificationProps {
  isVerified?: boolean;
  status?: string;
  documentUrl?: string;
}

const AddressVerification = ({ isVerified, status, documentUrl }: AddressVerificationProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user?.id) throw new Error("Not authenticated");

      setUploading(true);
      
      // Upload file to Supabase storage (we'll create a public bucket)
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      // For now, we'll store as base64 in the database since we don't have storage set up
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = async () => {
          try {
            const { error } = await supabase
              .from('profiles')
              .update({
                address_verification_document_url: reader.result as string,
                address_verification_status: 'pending',
                verification_submitted_at: new Date().toISOString()
              })
              .eq('id', user.id);

            if (error) throw error;
            resolve(reader.result);
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast({
        title: "Επιτυχία!",
        description: "Το έγγραφο επαλήθευσης διεύθυνσης στάλθηκε προς έλεγχο",
      });
    },
    onError: (error) => {
      toast({
        title: "Σφάλμα",
        description: "Δεν ήταν δυνατή η αποστολή του εγγράφου",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setUploading(false);
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Μη έγκυρος τύπος αρχείου",
        description: "Παρακαλώ ανεβάστε εικόνα (JPG, PNG) ή PDF",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Το αρχείο είναι πολύ μεγάλο",
        description: "Το μέγεθος του αρχείου δεν πρέπει να υπερβαίνει τα 5MB",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate(file);
  };

  const getStatusBadge = () => {
    if (isVerified) {
      return (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle className="h-4 w-4 mr-1" />
          Επαληθευμένη
        </Badge>
      );
    }
    
    if (status === 'pending') {
      return (
        <Badge variant="secondary">
          <Clock className="h-4 w-4 mr-1" />
          Σε εκκρεμότητα
        </Badge>
      );
    }
    
    if (status === 'rejected') {
      return (
        <Badge variant="destructive">
          <XCircle className="h-4 w-4 mr-1" />
          Απορρίφθηκε
        </Badge>
      );
    }
    
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">Επαλήθευση Διεύθυνσης</h4>
          <p className="text-sm text-gray-500">
            Ανεβάστε λογαριασμό (ΔΕΗ, ΕΥΔΑΠ, κ.λπ.) για επαλήθευση διεύθυνσης
          </p>
        </div>
        {getStatusBadge()}
      </div>

      {!isVerified && status !== 'pending' && (
        <div className="space-y-2">
          <Label htmlFor="address-document">Έγγραφο Επαλήθευσης</Label>
          <Input
            id="address-document"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <p className="text-xs text-gray-500">
            Αποδεκτοί τύποι: JPG, PNG, PDF (μέγιστο 5MB)
          </p>
        </div>
      )}

      {documentUrl && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FileText className="h-4 w-4" />
          <span>Έγγραφο ανεβάστηκε</span>
        </div>
      )}

      {uploading && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <Upload className="h-4 w-4 animate-pulse" />
          <span>Ανέβασμα εγγράφου...</span>
        </div>
      )}
    </div>
  );
};

export default AddressVerification;
