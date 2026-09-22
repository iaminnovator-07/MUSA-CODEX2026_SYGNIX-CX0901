import { Navigate } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { Shield } from "lucide-react";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Shield className="w-10 h-10 text-primary animate-pulse" />
          <span className="font-display text-sm text-muted-foreground tracking-wider">LOADING...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
