
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import UserRank from "@/components/user/UserRank";

interface SuccessScreenProps {
  resetForm: () => void;
}

const SuccessScreen = ({ resetForm }: SuccessScreenProps) => {
  return (
    <div className="text-center py-8">
      <div className="bg-green-50 border border-green-200 rounded-full mx-auto h-16 w-16 flex items-center justify-center mb-4">
        <CheckCircle2 className="h-8 w-8 text-green-500" />
      </div>
      <h3 className="text-lg font-medium mb-2">Ευχαριστούμε!</h3>
      <p className="text-gray-600 mb-6">
        Η αναφορά σας καταχωρήθηκε με επιτυχία και θα ελεγχθεί από την ομάδα μας το συντομότερο δυνατό.
      </p>
      
      <div className="mb-6">
        <UserRank showProgress={true} size="lg" />
      </div>
      
      <Button 
        onClick={resetForm}
        className="bg-strays-orange hover:bg-strays-dark-orange"
      >
        Νέα Αναφορά
      </Button>
    </div>
  );
};

export default SuccessScreen;
