import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminRoute({ children }) {
  const { user, loading, isStaff } = useAuth();
  const token = localStorage.getItem("access");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <main style={{ padding: "48px 24px", textAlign: "center", color: "#64748b" }}>
        Chargement...
      </main>
    );
  }

  if (!user || !isStaff) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRoute;
