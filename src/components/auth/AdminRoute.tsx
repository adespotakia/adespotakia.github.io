
import { ReactNode } from "react";
import { useUserRole } from "@/hooks/useUserRole";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface AdminRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

const AdminRoute = ({ children, fallback }: AdminRouteProps) => {
  const { isAdmin, isLoading } = useUserRole();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Έλεγχος δικαιωμάτων...</span>
      </div>
    );
  }

  if (!isAdmin) {
    return fallback || (
      <Alert className="max-w-md mx-auto mt-8">
        <AlertDescription>
          Δεν έχετε δικαίωμα πρόσβασης σε αυτή την ενότητα. Απαιτούνται δικαιώματα διαχειριστή.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};

export default AdminRoute;
