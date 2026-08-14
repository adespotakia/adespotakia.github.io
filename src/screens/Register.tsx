
import { useState, useEffect } from "react";
import { Link, useNavigate } from "@/lib/router-compat";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import RegistrationForm, { registerSchema } from "@/components/auth/RegistrationForm";
import { z } from "zod";

const Register = () => {
  const { register: registerUser, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Redirect if already fully authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleRegisterSubmit = async (values: z.infer<typeof registerSchema>) => {
    setIsLoading(true);
    const success = await registerUser(values.username, values.email, values.password);
    setIsLoading(false);

    if (success) {
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className={`${isMobile ? 'w-full' : 'w-[450px]'} space-y-6`}>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Δημιουργία λογαριασμού</h1>
          <p className="text-sm text-gray-600 mt-2">
            Συμπληρώστε τα στοιχεία σας για να δημιουργήσετε λογαριασμό
          </p>
        </div>

        <RegistrationForm
          onSubmit={handleRegisterSubmit}
          isLoading={isLoading}
        />

        <div className="text-center text-sm">
          <p>
            Έχετε ήδη λογαριασμό;{" "}
            <Link
              to="/login"
              className="font-medium text-strays-orange hover:underline"
            >
              Σύνδεση
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
