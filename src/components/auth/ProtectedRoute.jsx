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

    

    if (authState.status === "Submitted") {
        return <Navigate to="/access-pending" replace />;
    }

    if (authState.status === "Rejected") {
        return <Navigate to="/access-rejected" replace />;
    }

    if (authState.status === "no_request") {
        return <Navigate to="/request-access" replace />;
    }

    if (!authState.authenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
