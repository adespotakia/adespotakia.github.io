
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const editSchema = z.object({
  name: z.string().min(1, "Το όνομα είναι υποχρεωτικό"),
  age: z.number().min(0, "Η ηλικία πρέπει να είναι θετικός αριθμός").optional(),
  gender: z.string().optional(),
  furColors: z.string().optional(),
  locationDescription: z.string().optional(),
  story: z.string().optional(),
  isNeutered: z.boolean().default(false),
  neuteringVet: z.string().optional(),
  neuteringDate: z.string().optional(),
  possibleRelatives: z.string().optional(),
  expensesPaidBy: z.string().optional(),
  availableForAdoption: z.boolean().default(false),
});

type EditFormData = z.infer<typeof editSchema>;

interface Stray {
  id: string;
  name: string;
  age: number | null;
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

interface EditStrayDialogProps {
  stray: Stray;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStrayUpdated: (stray: Stray) => void;
}

const EditStrayDialog = ({ 
  stray, 
  open, 
  onOpenChange, 
  onStrayUpdated 
}: EditStrayDialogProps) => {
  const { toast } = useToast();
  
  const form = useForm<EditFormData>({
    resolver: zodResolver(editSchema) as never,
    defaultValues: {
      name: stray.name,
      age: stray.age || undefined,
      gender: stray.gender || "",
      furColors: stray.fur_colors || "",
      locationDescription: stray.location_description || "",
      story: stray.story || "",
      isNeutered: stray.is_neutered,
      neuteringVet: stray.neutering_vet || "",
      neuteringDate: stray.neutering_date || "",
      possibleRelatives: stray.possible_relatives || "",
      expensesPaidBy: stray.expenses_paid_by || "",
      availableForAdoption: stray.available_for_adoption || false,
    },
  });

  const onSubmit = async (data: EditFormData) => {
    try {
      const updateData = {
        name: data.name,
        age: data.age || null,
        gender: data.gender || null,
        fur_colors: data.furColors || null,
        location_description: data.locationDescription || null,
        story: data.story || null,
        is_neutered: data.isNeutered,
        neutering_vet: data.isNeutered ? data.neuteringVet || null : null,
        neutering_date: data.isNeutered && data.neuteringDate ? data.neuteringDate : null,
        possible_relatives: data.possibleRelatives || null,
        expenses_paid_by: data.expensesPaidBy || null,
        available_for_adoption: data.availableForAdoption,
        updated_at: new Date().toISOString(),
      };

      const { data: updatedStray, error } = await supabase
        .from("strays")
        .update(updateData)
        .eq("id", stray.id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Επιτυχής ενημέρωση!",
        description: "Τα στοιχεία του αδέσποτου ενημερώθηκαν επιτυχώς.",
      });

      onStrayUpdated(updatedStray as never);
    } catch (error) {
      console.error("Error updating stray:", error);
      toast({
        title: "Σφάλμα",
        description: "Υπήρξε πρόβλημα κατά την ενημέρωση. Παρακαλώ δοκιμάστε ξανά.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Επεξεργασία στοιχείων: {stray.name}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Όνομα αδέσποτου *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ηλικία (σε χρόνια)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Φύλο</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={field.value || "Κενό"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Αρσενικό</SelectItem>
                      <SelectItem value="female">Θηλυκό</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="furColors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Χρώματα τριχώματος</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={field.value || "Κενό"} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="locationDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Περιγραφή τοποθεσίας</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={field.value || "Κενό"} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="story"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ιστορία</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder={field.value || "Κενό"} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isNeutered"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Είναι στειρωμένος/η;</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {form.watch("isNeutered") && (
              <>
                 <FormField
                   control={form.control}
                   name="neuteringVet"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>Κτηνίατρος που έκανε τη στείρωση</FormLabel>
                       <FormControl>
                         <Input {...field} placeholder={field.value || "Κενό"} />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                 />

                 <FormField
                   control={form.control}
                   name="neuteringDate"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>Ημερομηνία στείρωσης</FormLabel>
                       <FormControl>
                         <Input type="date" {...field} placeholder={field.value || "Κενό"} />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
              </>
            )}

            <FormField
              control={form.control}
              name="possibleRelatives"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Πιθανοί συγγενείς</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder={field.value || "Κενό"} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expensesPaidBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ποιος πλήρωσε τα έξοδα</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={field.value || "Κενό"} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="availableForAdoption"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Διαθέσιμο για υιοθεσία</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Ακύρωση
              </Button>
              <Button type="submit">
                Αποθήκευση
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditStrayDialog;
