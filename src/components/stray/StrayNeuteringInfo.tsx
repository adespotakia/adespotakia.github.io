
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface StrayNeuteringInfoProps {
  form: UseFormReturn<any>;
}

const StrayNeuteringInfo = ({ form }: StrayNeuteringInfoProps) => {
  const isNeutered = form.watch("isNeutered");

  return (
    <div className="space-y-4">
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
              <FormLabel>Είναι στειρωμένο;</FormLabel>
            </div>
          </FormItem>
        )}
      />

      {isNeutered && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <FormField
            control={form.control}
            name="neuteringVet"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Κτηνίατρος που έκανε τη στείρωση</FormLabel>
                <FormControl>
                  <Input placeholder="Όνομα κτηνιάτρου" {...field} />
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
                  <Input type="date" {...field} />
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
                  <Input placeholder="π.χ. Τοπική ομάδα εθελοντών" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
};

export default StrayNeuteringInfo;
