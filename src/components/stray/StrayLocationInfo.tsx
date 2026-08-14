
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import AddressAutocomplete from "@/components/common/AddressAutocomplete";

interface StrayLocationInfoProps {
  form: UseFormReturn<any>;
}

const StrayLocationInfo = ({ form }: StrayLocationInfoProps) => {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="locationDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Τοποθεσία αδέσποτου</FormLabel>
            <FormControl>
              <AddressAutocomplete
                value={field.value ?? ""}
                onChange={field.onChange}
                placeholder="Πληκτρολογήστε διεύθυνση στην Ξάνθη"
              />
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
            <FormLabel>Σύντομη ιστορία</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Διηγηθείτε όσα γνωρίζετε από την ιστορία του αδέσποτου..."
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default StrayLocationInfo;
