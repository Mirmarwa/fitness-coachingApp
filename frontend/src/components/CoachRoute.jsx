import { Navigate } from "react-router-dom";

function CoachRoute({ children }) {
  const token = localStorage.getItem("access");
  
  let isCoach = false;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      isCoach = payload.role === "coach";
    } catch {
      isCoach = false;
    }
  }

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (!isCoach) {
    return <Navigate to="/" />;
  }

  return children;
}

export default CoachRoute;
