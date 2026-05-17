import { useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, isStaff, isCoach, logout } = useAuth();

  const isLoggedIn = Boolean(localStorage.getItem("access") && user);

  useEffect(() => {
    if (isLoggedIn && isStaff) {
      const clientCoachingPaths = [
        "/dashboard",
        "/coach-dashboard",
        "/profile",
        "/messages",
        "/appointments",
        "/programmes",
        "/coaches",
        "/progress",
      ];
      const path = location.pathname;
      if (
        clientCoachingPaths.includes(path) ||
        path.startsWith("/coach/") ||
        path.startsWith("/program/")
      ) {
        navigate("/admin-dashboard");
      }
    }
  }, [isLoggedIn, isStaff, location.pathname, navigate]);
  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    user?.username ||
    localStorage.getItem("user_display_name") ||
    "";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="app-navbar">
      <style>
        {`
          .app-navbar {
            position: sticky;
            top: 0;
            z-index: 30;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            padding: 14px 30px;
            background: rgba(255, 255, 255, 0.92);
            border-bottom: 1px solid rgba(15, 118, 110, 0.12);
            box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
            backdrop-filter: blur(16px);
          }

          .app-logo {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            color: #0f172a;
            font-size: 18px;
            font-weight: 900;
            text-decoration: none;
            white-space: nowrap;
          }

          .app-logo-mark {
            display: grid;
            place-items: center;
            width: 38px;
            height: 38px;
            border-radius: 14px;
            background: linear-gradient(135deg, #0f766e, #16a34a);
            color: white;
            font-size: 14px;
            box-shadow: 0 12px 24px rgba(15, 118, 110, 0.24);
          }

          .app-nav-links {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 8px;
            flex-wrap: wrap;
          }

          .app-nav-link,
          .user-greeting,
          .logout-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 38px;
            padding: 0 13px;
            border-radius: 999px;
            color: #475569;
            font-size: 14px;
            font-weight: 850;
            text-decoration: none;
            transition: transform 160ms ease, background 160ms ease, color 160ms ease, box-shadow 160ms ease;
          }

          .app-nav-link:hover,
          .logout-button:hover {
            transform: translateY(-1px);
            background: #f0fdfa;
            color: #0f766e;
          }

          .user-greeting {
            background: #f0fdfa;
            color: #0f766e;
            box-shadow: inset 0 0 0 1px rgba(15, 118, 110, 0.12);
          }

          .app-nav-link.active {
            background: #dcfce7;
            color: #166534;
            box-shadow: inset 0 0 0 1px rgba(22, 101, 52, 0.08);
          }

          .logout-button {
            border: 0;
            background: #0f766e;
            color: white;
            cursor: pointer;
            box-shadow: 0 12px 24px rgba(15, 118, 110, 0.2);
          }

          .logout-button:hover {
            background: #115e59;
            color: white;
          }

          @media (max-width: 760px) {
            .app-navbar {
              align-items: flex-start;
              flex-direction: column;
              padding: 14px 16px;
            }

            .app-nav-links {
              width: 100%;
              justify-content: flex-start;
            }
          }
        `}
      </style>

      <Link to="/" className="app-logo">
        <span className="app-logo-mark">FC</span>
        <span>Fitness Coaching</span>
      </Link>

      <div className="app-nav-links">
        <NavLink to="/" className="app-nav-link">
          Accueil
        </NavLink>
        {!isStaff && (
          <NavLink to="/programmes" className="app-nav-link">
            Programmes
          </NavLink>
        )}
        {!isStaff && (
          <NavLink to="/coaches" className="app-nav-link">
            Coachs
          </NavLink>
        )}
        {isLoggedIn && isStaff && (
          <NavLink to="/admin-dashboard" className="app-nav-link">
            Admin
          </NavLink>
        )}
        {isLoggedIn && !isStaff && !isCoach && (
          <NavLink to="/dashboard" className="app-nav-link">
            Dashboard
          </NavLink>
        )}
        {isLoggedIn && isCoach && !isStaff && (
          <NavLink to="/coach-dashboard" className="app-nav-link">
            Coach Dashboard
          </NavLink>
        )}
        <NavLink to="/articles" className="app-nav-link">
          Articles
        </NavLink>
        {isLoggedIn && !isStaff && (
          <NavLink to="/profile" className="app-nav-link">
            Profile
          </NavLink>
        )}
        {isLoggedIn && !isStaff && (
          <NavLink to="/messages" className="app-nav-link">
            Messages
          </NavLink>
        )}
        {isLoggedIn && !isStaff && (
          <NavLink to="/appointments" className="app-nav-link">
            Rendez-vous
          </NavLink>
        )}
        {isLoggedIn && !isCoach && !isStaff && (
          <NavLink to="/progress" className="app-nav-link">
            Progression
          </NavLink>
        )}

        {isLoggedIn ? (
          <>
            {!loading && displayName && (
              <span className="user-greeting">Bonjour {displayName}</span>
            )}
            <button type="button" className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="app-nav-link">
              Login
            </NavLink>
            <NavLink to="/register" className="app-nav-link">
              Register
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}
