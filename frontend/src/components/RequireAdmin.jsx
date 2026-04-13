import { Navigate } from "react-router-dom";
import { canAccessAdminPanel } from "../utils/auth";

function RequireAdmin({ children }) {
  if (!canAccessAdminPanel()) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
}

export default RequireAdmin;
