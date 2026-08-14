
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useRanking } from "@/hooks/use-ranking";
import { useQuery } from "@tanstack/react-query";
import StrayImageUpload from "./StrayImageUpload";
import StrayBasicInfo from "./StrayBasicInfo";
import StrayCharacteristics from "./StrayCharacteristics";
import StrayTagsInput from "./StrayTagsInput";
import StrayLocationInfo from "./StrayLocationInfo";
import StrayNeuteringInfo from "./StrayNeuteringInfo";
import StrayRegistererInfo from "./StrayRegistererInfo";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";

const registrationSchema = z.object({
  animalType: z.string().min(1, "Ο τύπος ζώου είναι υποχρεωτικός"),
  name: z.string().min(1, "Το όνομα είναι υποχρεωτικό"),
  birthYear: z.number().min(2000).max(new Date().getFullYear()).optional(),
  birthMonth: z.number().min(1).max(12).optional(),
  ageUnknown: z.boolean().default(false),
  gender: z.string().optional(),
  characteristics: z.array(z.string()).default([]),
  age: z.number().min(0, "Η ηλικία πρέπει να είναι θετικός αριθμός").optional(),
  furColors: z.array(z.string()).default([]),
  locationDescription: z.string().optional(),
  story: z.string().optional(),
  isNeutered: z.boolean().default(false),
  neuteringVet: z.string().optional(),
  neuteringDate: z.string().optional(),
  possibleRelatives: z.array(z.string()).default([]),
  expensesPaidBy: z.string().optional(),
  registererUsername: z.string().optional(),
  availableForAdoption: z.boolean().default(false),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface StrayRegistrationFormProps {
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  onSuccess: () => void;
  defaultAvailableForAdoption?: boolean;
  /** Optional location picked/fine-tuned on the map. Overrides live GPS when set. */
  location?: { lat: number; lng: number } | null;
}

const StrayRegistrationForm = ({ 
  isSubmitting, 
  setIsSubmitting, 
  onSuccess,
  defaultAvailableForAdoption = false,
  location = null,
}: StrayRegistrationFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { awardStrayRegistrationPoints } = useRanking();
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  
  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema) as never,
    defaultValues: {
      animalType: "",
      name: "",
      birthYear: undefined,
      birthMonth: undefined,
      ageUnknown: false,
      gender: "",
      characteristics: [],
      age: undefined,
      furColors: [],
      locationDescription: "",
      story: "",
      isNeutered: false,
      neuteringVet: "",
      neuteringDate: "",
      possibleRelatives: [],
      expensesPaidBy: "",
      registererUsername: "",
      availableForAdoption: defaultAvailableForAdoption,
    },
  });

  // Get user profile for username
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const uploadImages = async (images: File[]): Promise<string[]> => {
    const imageUrls: string[] = [];
    
    for (let i = 0; i < Math.min(images.length, 5); i++) {
      const image = images[i];
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2);
      const extension = image.name.split('.').pop()?.toLowerCase() || '';
      const fileName = `${user!.id}/${timestamp}_${random}.${extension}`;
      
      console.log("Uploading stray image:", fileName);
      
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('strays')
        .upload(fileName, image, { 
          cacheControl: '3600',
          upsert: false 
        });

      if (uploadError) {
        console.error("Stray image upload error:", uploadError);
        throw new Error(`Σφάλμα μεταφόρτωσης εικόνας: ${uploadError.message}`);
      }

      if (uploadData) {
        const { data: urlData } = supabase.storage
          .from('strays')
          .getPublicUrl(uploadData.path);
        imageUrls.push(urlData.publicUrl);
        console.log("Stray image uploaded successfully:", urlData.publicUrl);
      }
    }
    
    return imageUrls;
  };

  const onSubmit = async (data: RegistrationFormData) => {
    if (!user?.id) {
      toast({
        title: "Σφάλμα",
        description: "Δεν είστε συνδεδεμένος",
        variant: "destructive",
      });
      return;
    }

    if (selectedImages.length === 0) {
      toast({
        title: "Απαιτούνται φωτογραφίες",
        description: "Παρακαλώ ανεβάστε τουλάχιστον μία φωτογραφία",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    console.log("Starting stray registration with user:", user.id);
    console.log("Form data:", data);
    
    try {
      let imageUrls: string[] = [];

      if (selectedImages.length > 0) {
        console.log("Uploading images:", selectedImages.length);
        imageUrls = await uploadImages(selectedImages);
      }

      // Prefer the location fine-tuned on the map; fall back to live GPS.
      const coords = location
        ? location
        : await new Promise<{ lat: number; lng: number } | null>((resolve) => {
            if (typeof navigator === "undefined" || !navigator.geolocation) {
              resolve(null);
              return;
            }
            navigator.geolocation.getCurrentPosition(
              (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
              () => resolve(null),
              { enableHighAccuracy: true, timeout: 8000 },
            );
          });

      const strayData = {
        animal_type: data.animalType,
        name: data.name.trim(),
        birth_year: data.ageUnknown ? null : (data.birthYear || null),
        birth_month: data.ageUnknown ? null : (data.birthMonth || null),
        gender: data.gender || null,
        characteristics: data.characteristics.length > 0 ? data.characteristics : null,
        age: data.ageUnknown ? null : (data.age || null),
        coat_colors_tags: data.furColors.length > 0 ? data.furColors : null,
        location_description: data.locationDescription?.trim() || null,
        story: data.story?.trim() || null,
        image_url: imageUrls.length > 0 ? imageUrls[0] : null,
        image_urls: imageUrls.length > 0 ? imageUrls : null,
        is_neutered: data.isNeutered,
        neutering_vet: data.isNeutered && data.neuteringVet ? data.neuteringVet.trim() : null,
        neutering_date: data.isNeutered && data.neuteringDate ? data.neuteringDate : null,
        relative_animals_tags: data.possibleRelatives.length > 0 ? data.possibleRelatives : null,
        expenses_paid_by: data.expensesPaidBy?.trim() || null,
        registered_by: user.id,
        registerer_username: profile?.username || null,
        available_for_adoption: data.availableForAdoption,
        latitude: coords?.lat ?? null,
        longitude: coords?.lng ?? null,
      };

      console.log("Submitting stray data:", strayData);

      const { data: insertedStray, error } = await supabase
        .from("strays")
        .insert([strayData] as never)
        .select()
        .single();

      if (error) {
        console.error("Database error:", error);
        throw new Error(`Σφάλμα βάσης δεδομένων: ${error.message}`);
      }

      console.log("Stray registered successfully:", insertedStray);

      toast({
        title: "Επιτυχής καταχώρηση!",
        description: "Το αδέσποτο καταχωρήθηκε επιτυχώς στη βάση δεδομένων.",
      });

      try {
        await awardStrayRegistrationPoints(insertedStray.id);
        console.log("Points awarded successfully");
      } catch (pointsError) {
        console.error("Error awarding points:", pointsError);
      }

      onSuccess();
    } catch (error) {
      console.error("Error registering stray:", error);
      toast({
        title: "Σφάλμα",
        description: error instanceof Error ? error.message : "Υπήρξε πρόβλημα κατά την καταχώρηση. Παρακαλώ δοκιμάστε ξανά.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <StrayRegistererInfo form={form} />

        <StrayImageUpload 
          images={selectedImages}
          setImages={setSelectedImages}
        />

        <StrayBasicInfo form={form} />

        <StrayTagsInput
          label="Χρώματα τριχώματος"
          tags={form.watch("furColors")}
          onTagsChange={(tags) => form.setValue("furColors", tags)}
          placeholder="Πληκτρολογήστε το χρώμα και πατήστε Enter"
        />

        <StrayTagsInput
          label="Πιθανά συγγενικά ζώα"
          tags={form.watch("possibleRelatives")}
          onTagsChange={(tags) => form.setValue("possibleRelatives", tags)}
          placeholder="όνοματα αδέσποτου άλλων καταχωρήσεων"
        />

        <StrayCharacteristics
          value={form.watch("characteristics")}
          onChange={(characteristics) => form.setValue("characteristics", characteristics)}
        />

        <StrayLocationInfo form={form} />

        <StrayNeuteringInfo form={form} />

        <FormField
          control={form.control}
          name="availableForAdoption"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Διαθέσιμο για υιοθεσία
                </FormLabel>
                <p className="text-sm text-muted-foreground">
                  Επιλέξτε αν θέλετε αυτό το αδέσποτο να εμφανίζεται στη σελίδα υιοθεσιών
                </p>
              </div>
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting || selectedImages.length === 0}
        >
          {isSubmitting ? "Καταχώρηση..." : "Καταχώρηση Αδέσποτου"}
        </Button>
      </form>
    </Form>
  );
};

export default StrayRegistrationForm;
