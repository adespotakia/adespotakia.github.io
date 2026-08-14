
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface StrayBasicInfoProps {
  form: UseFormReturn<any>;
}

const StrayBasicInfo = ({ form }: StrayBasicInfoProps) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2000 + 1 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: "Ιανουάριος" },
    { value: 2, label: "Φεβρουάριος" },
    { value: 3, label: "Μάρτιος" },
    { value: 4, label: "Απρίλιος" },
    { value: 5, label: "Μάιος" },
    { value: 6, label: "Ιούνιος" },
    { value: 7, label: "Ιούλιος" },
    { value: 8, label: "Αύγουστος" },
    { value: 9, label: "Σεπτέμβριος" },
    { value: 10, label: "Οκτώβριος" },
    { value: 11, label: "Νοέμβριος" },
    { value: 12, label: "Δεκέμβριος" }
  ];

  const calculateAgeString = (birthYear?: number, birthMonth?: number) => {
    if (!birthYear) return "";
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    const birthDate = new Date(birthYear, (birthMonth || 1) - 1);
    
    let years = currentYear - birthYear;
    let months = currentMonth - (birthMonth || 1);
    
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    
    if (years === 0 && months === 0) {
      return "Νεογέννητο";
    } else if (years === 0) {
      return `${months} μήνας/μήνες`;
    } else if (months === 0) {
      return `${years} χρόνος/χρόνια`;
    } else {
      return `${years} χρόνος/χρόνια και ${months} μήνας/μήνες`;
    }
  };

  const calculateAge = (birthYear?: number, birthMonth?: number) => {
    if (!birthYear) return undefined;
    
    const now = new Date();
    const birthDate = new Date(birthYear, (birthMonth || 1) - 1);
    const diffTime = now.getTime() - birthDate.getTime();
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    
    return Math.floor(diffYears * 10) / 10; // Round to 1 decimal place
  };

  // Watch for changes in birth year and month to auto-calculate age
  const birthYear = form.watch("birthYear");
  const birthMonth = form.watch("birthMonth");
  const ageUnknown = form.watch("ageUnknown");
  
  // Auto-update age when birth year or month changes
  React.useEffect(() => {
    if (!ageUnknown) {
      const calculatedAge = calculateAge(birthYear, birthMonth);
      if (calculatedAge !== undefined) {
        form.setValue("age", calculatedAge);
      }
    }
  }, [birthYear, birthMonth, ageUnknown, form]);

  // Clear birth data when age unknown is checked
  React.useEffect(() => {
    if (ageUnknown) {
      form.setValue("birthYear", undefined);
      form.setValue("birthMonth", undefined);
      form.setValue("age", undefined);
    }
  }, [ageUnknown, form]);

  const ageDisplayString = calculateAgeString(birthYear, birthMonth);

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="animalType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Τύπος ζώου *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Επιλέξτε τύπο ζώου" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="cat">Γάτα</SelectItem>
                <SelectItem value="dog">Σκύλος</SelectItem>
                <SelectItem value="other">Άλλο</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Όνομα αδέσποτου *</FormLabel>
            <FormControl>
              <Input 
                placeholder="π.χ. το όνομα με το οποίο είναι γνωστό" 
                {...field}
                maxLength={10}
                onChange={(e) => {
                  const value = e.target.value.slice(0, 10);
                  field.onChange(value);
                }}
              />
            </FormControl>
            <p className="text-xs text-gray-500">
              {field.value?.length || 0}/10 χαρακτήρες
            </p>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="ageUnknown"
            checked={ageUnknown}
            onCheckedChange={(checked) => form.setValue("ageUnknown", !!checked)}
          />
          <Label htmlFor="ageUnknown">Δεν γνωρίζω την ηλικία</Label>
        </div>

        {!ageUnknown && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="birthYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Έτος γέννησης</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Επιλέξτε έτος" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="birthMonth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Μήνας γέννησης</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Επιλέξτε μήνα" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value.toString()}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ηλικία</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="Υπολογίζεται αυτόματα"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        readOnly={!!(birthYear)}
                        className={birthYear ? "bg-gray-50" : ""}
                      />
                    </FormControl>
                    {ageDisplayString && (
                      <p className="text-xs text-gray-600 font-medium">
                        {ageDisplayString}
                      </p>
                    )}
                    {birthYear && (
                      <p className="text-xs text-gray-500">
                        Υπολογίστηκε αυτόματα από την ημερομηνία γέννησης
                      </p>
                    )}
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
                          <SelectValue placeholder="Επιλέξτε φύλο" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Αρσενικό</SelectItem>
                        <SelectItem value="female">Θηλυκό</SelectItem>
                        <SelectItem value="unknown">Άγνωστο</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StrayBasicInfo;
