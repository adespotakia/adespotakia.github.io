
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Schema definition - simplified for demo mode
export const phoneVerificationSchema = z.object({
  phone: z.string().min(10, {
    message: "Παρακαλώ εισάγετε έναν έγκυρο αριθμό τηλεφώνου",
  }),
  code: z.string().length(6, {
    message: "Ο κωδικός επιβεβαίωσης πρέπει να είναι 6 ψηφία",
  }),
});

interface PhoneVerificationFormProps {
  onSubmit: (values: z.infer<typeof phoneVerificationSchema>) => Promise<void>;
  isLoading: boolean;
  phoneNumber: string;
  isCodeSent: boolean;
  onSendCode: () => void;
  onChangePhone: () => void;
}

export const PhoneVerificationForm = ({ 
  onSubmit,
  isLoading,
  phoneNumber,
  isCodeSent,
  onSendCode,
  onChangePhone
}: PhoneVerificationFormProps) => {
  const verificationForm = useForm<z.infer<typeof phoneVerificationSchema>>({
    resolver: zodResolver(phoneVerificationSchema),
    defaultValues: {
      phone: phoneNumber,
      code: "",
    },
  });

  const handleFormSubmit = async (values: z.infer<typeof phoneVerificationSchema>) => {
    console.log('Form submitted with code:', values.code);
    await onSubmit(values);
  };

  return (
    <Form {...verificationForm}>
      <form onSubmit={verificationForm.handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Demo bypass notice */}
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription>
            <strong>Demo Mode:</strong> Εισάγετε οποιοδήποτε 6-ψήφιο κωδικό (π.χ. 123456) για επιβεβαίωση.
          </AlertDescription>
        </Alert>

        <FormField
          control={verificationForm.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Αριθμός τηλεφώνου</FormLabel>
              <FormControl>
                <div className="flex space-x-2">
                  <Input 
                    placeholder="69xxxxxxxx" 
                    {...field} 
                    type="tel"
                    disabled={isCodeSent}
                    className="flex-grow"
                  />
                  {!isCodeSent && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={onSendCode}
                      disabled={!field.value || field.value.length < 10}
                    >
                      Αποστολή κωδικού
                    </Button>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {isCodeSent && (
          <FormField
            control={verificationForm.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Κωδικός επιβεβαίωσης</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Εισάγετε 6-ψήφιο κωδικό" 
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      field.onChange(value);
                    }}
                    maxLength={6}
                    type="tel"
                  />
                </FormControl>
                <FormMessage />
                <p className="text-sm text-gray-500 mt-1">
                  Demo Mode: Οποιοσδήποτε 6-ψήφιος κωδικός θα λειτουργήσει (π.χ. 123456)
                </p>
              </FormItem>
            )}
          />
        )}

        {isCodeSent && (
          <Button 
            type="submit" 
            className="w-full bg-strays-orange hover:bg-strays-dark-orange"
            disabled={isLoading}
          >
            {isLoading ? "Επιβεβαίωση..." : "Επιβεβαίωση τηλεφώνου"}
          </Button>
        )}
        
        {isCodeSent && (
          <div className="text-center text-sm">
            <Button 
              type="button" 
              variant="link" 
              className="text-strays-orange"
              onClick={onChangePhone}
            >
              Αλλαγή αριθμού τηλεφώνου
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
};

export default PhoneVerificationForm;
