
import { useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import StrayRegistrationForm from "@/components/stray/StrayRegistrationForm";

const StrayRegistration = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Πρόσβαση Απαραίτητη</h1>
          <p className="text-gray-600 mb-6">
            Πρέπει να συνδεθείτε για να καταχωρήσετε έναν αδέσποτο.
          </p>
          <Button onClick={() => navigate("/login")}>
            Σύνδεση
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Επιστροφή
        </Button>
        <p className="text-gray-600 mt-2">
          Συμπληρώστε τα στοιχεία του αδέσποτου για να το καταχωρήσετε στη βάση δεδομένων και τέλος πατήστε το κουμπί καταχώρηση.
        </p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Στοιχεία Αδέσποτου</CardTitle>
        </CardHeader>
        <CardContent>
          <StrayRegistrationForm 
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
            onSuccess={() => navigate("/profile")}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default StrayRegistration;
