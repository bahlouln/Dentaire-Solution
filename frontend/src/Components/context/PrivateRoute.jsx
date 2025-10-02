import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const PrivateRoute = ({ children, requireAdmin = false }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div
                    className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-transparent"
                    role="status"
                    aria-label="Loading"
                />
            </div>
        );
    }

    if (!user) {
        return <Navigate to={requireAdmin ? "/admin/login" : "/login"} replace />;
    }

    if (requireAdmin && user.role !== "admin") {
        return <Navigate to="/login" replace />;
    }

    if (!requireAdmin && user.role !== "dentiste" && user.role !== "secretaire") {
        return <Navigate to="/admin/login" replace />;
    }

    return children;
};

export default PrivateRoute;
