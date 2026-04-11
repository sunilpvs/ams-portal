import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { checkAuth } from "../../services/auth/auth";

const ProtectedRoute = ({ children }) => {
  const [authState, setAuthState] = useState({ checking: true });

  useEffect(() => {
    const verify = async () => {
      try {
        const result = await checkAuth();
        console.log("Auth check result:", result);
        setAuthState({ checking: false, ...result });
      } catch (err) {
        console.error("Auth check failed:", err);
        setAuthState({ checking: false, authenticated: false });
      }
    };

    verify();
  }, []);

  if (authState.checking) return <div>Loading...</div>;

  // 🔐 Step 1: Authentication FIRST
  if (!authState.authenticated) {
    return <Navigate to="/login" replace />;
  }

  const status = authState.status?.toLowerCase();

  // 🔓 Step 2: Authorization
  if (status === "no_request") {
    return <Navigate to="/request-access" replace />;
  }

  if (status === "submitted") {
    return <Navigate to="/access-pending" replace />;
  }

  if (status === "rejected") {
    return <Navigate to="/access-rejected" replace />;
  }

  if (status === "granted") {
    return children;
  }

  // 🚨 Fallback safety
  return <Navigate to="/request-access" replace />;
};

export default ProtectedRoute;