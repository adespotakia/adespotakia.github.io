
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { validatePhone } from "@/utils/inputValidation";
import { logSecurityEvent } from "@/utils/errorHandling";

interface PhoneVerificationProps {
  isVerified: boolean;
}

export const PhoneVerification = ({ isVerified }: PhoneVerificationProps) => {
  const { toast } = useToast();
  const { verifyPhone, user } = useAuth();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  const sendVerificationCode = () => {
    // Validate phone number format
    if (!validatePhone(phone)) {
      toast({
        title: "Σφάλμα",
        description: "Παρακαλώ εισάγετε έναν έγκυρο ελληνικό αριθμό τηλεφώνου (π.χ. 6912345678)",
        variant: "destructive",
      });
      return;
    }

    // Rate limiting - max 3 attempts per session
    if (attemptCount >= 3) {
      logSecurityEvent('phone_verification_rate_limit', { phone, userId: user?.id });
      toast({
        title: "Πολλές προσπάθειες",
        description: "Παρακαλώ περιμένετε πριν δοκιμάσετε ξανά",
        variant: "destructive",
      });
      return;
    }
    
    setIsSending(true);
    setAttemptCount(prev => prev + 1);
    
    // In production, this would integrate with a real SMS service
    // For now, we'll use a mock implementation that still requires proper validation
    setTimeout(() => {
      setIsSending(false);
      setCodeSent(true);
      toast({
        title: "Κωδικός εστάλη",
        description: "Ένας κωδικός επαλήθευσης στάλθηκε στο τηλέφωνό σας",
      });
    }, 1500);
  };

  const verifyCode = async () => {
    // Enhanced validation - code must be exactly 6 digits
    if (!/^\d{6}$/.test(code)) {
      toast({
        title: "Σφάλμα",
        description: "Ο κωδικός επαλήθευσης πρέπει να είναι ακριβώς 6 ψηφία",
        variant: "destructive",
      });
      return;
    }
    
    setIsVerifying(true);
    
    try {
      const success = await verifyPhone(phone, code);
      
      if (success) {
        toast({
          title: "Επιτυχία",
          description: "Το τηλέφωνό σας επαληθεύτηκε με επιτυχία",
        });
        // Reset form
        setCodeSent(false);
        setPhone('');
        setCode('');
        setAttemptCount(0);
      } else {
        logSecurityEvent('failed_phone_verification', { phone, userId: user?.id });
      }
    } catch (error) {
      console.error('Verification error:', error);
      logSecurityEvent('phone_verification_error', { error, userId: user?.id });
      toast({
        title: "Σφάλμα",
        description: "Προέκυψε σφάλμα κατά την επαλήθευση",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  if (isVerified) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <div className="h-4 w-4 rounded-full bg-green-500" />
        <AlertTitle>Επαληθευμένο</AlertTitle>
        <AlertDescription>
          Ο αριθμός τηλεφώνου σας έχει επαληθευτεί.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="phone">Αριθμός Τηλεφώνου</Label>
        <div className="flex space-x-2">
          <Input
            id="phone"
            placeholder="6912345678"
            value={phone}
            onChange={(e) => {
              // Only allow numbers and remove any formatting
              const cleanPhone = e.target.value.replace(/\D/g, '');
              setPhone(cleanPhone);
            }}
            disabled={codeSent}
            maxLength={10}
            type="tel"
          />
          {!codeSent && (
            <Button 
              onClick={sendVerificationCode} 
              disabled={isSending || !validatePhone(phone) || attemptCount >= 3}
            >
              {isSending ? "Αποστολή..." : "Αποστολή κωδικού"}
            </Button>
          )}
        </div>
        {attemptCount > 0 && (
          <p className="text-xs text-gray-500">
            Προσπάθειες: {attemptCount}/3
          </p>
        )}
      </div>

      {codeSent && (
        <div className="space-y-2">
          <Label htmlFor="code">Κωδικός Επαλήθευσης</Label>
          <div className="flex space-x-2">
            <Input
              id="code"
              placeholder="123456"
              value={code}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setCode(value);
              }}
              maxLength={6}
              type="tel"
            />
            <Button 
              onClick={verifyCode} 
              disabled={isVerifying || code.length !== 6}
            >
              {isVerifying ? "Επαλήθευση..." : "Επαλήθευση"}
            </Button>
          </div>
        </div>
      )}

      {codeSent && (
        <Button 
          variant="link" 
          className="p-0 h-auto text-strays-orange"
          onClick={() => {
            setCodeSent(false);
            setCode('');
          }}
        >
          Αλλαγή αριθμού τηλεφώνου
        </Button>
      )}
    </>
  );
};

export default PhoneVerification;
