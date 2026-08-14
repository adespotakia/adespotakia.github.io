import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { Link } from "@/lib/router-compat";
import AccessRequestForm from "@/components/access/AccessRequestForm";

const SignupsClosed = () => {
  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <Card className="max-w-lg w-full text-center">
        <CardHeader>
          <div className="mx-auto w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <Clock className="h-7 w-7 text-orange-600" />
          </div>
          <CardTitle className="text-2xl">Οι εγγραφές είναι προσωρινά σε αναμονή</CardTitle>
          <CardDescription className="text-base mt-2">
            Η πλατφόρμα «Αδεσπολις» βρίσκεται αυτή τη στιγμή σε δοκιμαστική φάση.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-600">
            Δουλεύουμε για να βελτιώσουμε την εμπειρία σας. Οι νέες εγγραφές έχουν
            προσωρινά ανασταλεί και θα ενεργοποιηθούν ξανά σύντομα. Σας ευχαριστούμε
            για την υπομονή και το ενδιαφέρον σας!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="outline">
              <Link to="/">Επιστροφή στην Αρχική</Link>
            </Button>
            <Button asChild className="bg-strays-orange hover:bg-strays-dark-orange">
              <Link to="/login">Ήδη μέλος; Σύνδεση</Link>
            </Button>
          </div>

          <div className="border-t pt-6 text-left">
            <p className="mb-4 text-sm text-gray-700">
              Αν θέλετε να συμμετέχετε στην δοκιμαστική φάση, στείλτε ένα αίτημα πρόσβασης
              συμπληρώνοντας τη φόρμα παρακάτω.
            </p>
            <AccessRequestForm />
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default SignupsClosed;
