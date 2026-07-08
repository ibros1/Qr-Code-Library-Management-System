import { Navigate, Outlet } from "react-router";

import { useAuth } from "../../context/AuthContext";
import { TOKEN_STORAGE_KEY } from "../../services/api";

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const hasToken = Boolean(localStorage.getItem(TOKEN_STORAGE_KEY));

  if (!hasToken) {
    return <Navigate to="/auth/login" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-2 border-orange-200 border-t-orange-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
