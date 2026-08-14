
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@/lib/router-compat";
import { ArrowLeft } from "lucide-react";
import ReportForm from "@/components/report/ReportForm";

const Report = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Πρόσβαση Απαραίτητη</h1>
          <p className="text-gray-600 mb-6">
            Πρέπει να συνδεθείτε για να υποβάλετε αναφορά.
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
          Αναφέρετε έναν αδέσποτο που χρειάζεται βοήθεια
        </p>
      </div>

      <ReportForm />
    </div>
  );
};

export default Report;
