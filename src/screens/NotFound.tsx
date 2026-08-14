
import { useEffect } from "react";
import { useLocation, Link } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center">
      <div className="rounded-full bg-red-50 p-4 mb-6">
        <svg className="h-10 w-10 text-strays-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h1 className="text-5xl font-bold mb-4 text-gray-900">404</h1>
      <p className="text-xl text-gray-600 mb-6">
        Ωχ! Η σελίδα που αναζητάτε δεν βρέθηκε
      </p>
      <p className="text-gray-500 mb-8 text-center max-w-md">
        Η διεύθυνση URL μπορεί να είναι λανθασμένη ή η σελίδα μπορεί να έχει μετακινηθεί ή διαγραφεί.
      </p>
      <Link to="/">
        <Button 
          className="bg-strays-orange hover:bg-strays-dark-orange"
          size="lg"
        >
          Επιστροφή στην αρχική
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;
