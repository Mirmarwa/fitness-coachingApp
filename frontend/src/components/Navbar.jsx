import { useEffect, useState, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, isStaff, isCoach, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isLoggedIn = Boolean(localStorage.getItem("access") && user);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on path change
  useEffect(() => {
    setDropdownOpen(false);
  }, [location.pathname]);

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
    "Utilisateur";

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate("/login");
  };

  const userInitial = displayName ? displayName.charAt(0).toUpperCase() : "U";

  return (
    <nav className="app-navbar">
      <style>
        {`
          .app-navbar {
            position: sticky;
            top: 0;
            z-index: 100;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            padding: 16px 40px;
            background: rgba(9, 13, 16, 0.95);
            border-bottom: 1px solid rgba(16, 185, 129, 0.15);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(12px);
            font-family: Inter, system-ui, -apple-system, sans-serif;
          }

          .app-logo {
            display: inline-flex;
            align-items: center;
            gap: 12px;
            color: #ffffff;
            font-size: 20px;
            font-weight: 900;
            text-decoration: none;
            white-space: nowrap;
            letter-spacing: -0.5px;
            transition: opacity 0.2s ease;
          }

          .app-logo:hover {
            opacity: 0.9;
          }

          .app-logo-mark {
            display: grid;
            place-items: center;
            width: 40px;
            height: 40px;
            border-radius: 12px;
            background: linear-gradient(135deg, #10b981, #059669);
            color: #ffffff;
            font-size: 16px;
            font-weight: 950;
            box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
          }

          .app-logo-text {
            background: linear-gradient(to right, #ffffff, #e2e8f0);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .app-nav-links {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .app-nav-link {
            display: inline-flex;
            align-items: center;
            padding: 8px 16px;
            border-radius: 10px;
            color: #94a3b8;
            font-size: 14px;
            font-weight: 700;
            text-decoration: none;
            transition: all 200ms ease;
          }

          .app-nav-link:hover {
            color: #10b981;
            background: rgba(16, 185, 129, 0.08);
          }

          .app-nav-link.active {
            color: #ffffff;
            background: rgba(16, 185, 129, 0.15);
            border: 1px solid rgba(16, 185, 129, 0.25);
          }

          /* Avatar & Premium Dropdown */
          .user-menu-container {
            position: relative;
            margin-left: 10px;
          }

          .user-avatar-btn {
            display: flex;
            align-items: center;
            gap: 10px;
            background: rgba(16, 185, 129, 0.08);
            border: 1px solid rgba(16, 185, 129, 0.2);
            padding: 6px 14px 6px 8px;
            border-radius: 999px;
            cursor: pointer;
            transition: all 200ms ease;
            box-sizing: border-box;
          }

          .user-avatar-btn:hover {
            background: rgba(16, 185, 129, 0.15);
            border-color: rgba(16, 185, 129, 0.4);
            transform: translateY(-1px);
          }

          .avatar-circle {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            font-weight: 900;
            border-radius: 999px;
            font-size: 13px;
            box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
          }

          .avatar-name {
            color: #ffffff;
            font-size: 13px;
            font-weight: 800;
            max-width: 120px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .avatar-arrow {
            color: #94a3b8;
            font-size: 10px;
            transition: transform 200ms ease;
          }

          .user-avatar-btn.open .avatar-arrow {
            transform: rotate(180deg);
          }

          /* Dropdown List */
          .navbar-dropdown {
            position: absolute;
            right: 0;
            top: calc(100% + 12px);
            width: 220px;
            background: #0f1319;
            border: 1px solid rgba(16, 185, 129, 0.25);
            border-radius: 14px;
            padding: 8px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
            display: none;
            flex-direction: column;
            gap: 4px;
            animation: slideDown 220ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
            transform-origin: top right;
          }

          .navbar-dropdown.open {
            display: flex;
          }

          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-8px) scale(0.96);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          .dropdown-item {
            display: flex;
            align-items: center;
            padding: 10px 14px;
            border-radius: 10px;
            color: #94a3b8;
            font-size: 13.5px;
            font-weight: 700;
            text-decoration: none;
            transition: all 150ms ease;
            cursor: pointer;
            border: 0;
            background: transparent;
            width: 100%;
            text-align: left;
            box-sizing: border-box;
          }

          .dropdown-item:hover {
            color: #ffffff;
            background: rgba(16, 185, 129, 0.15);
          }

          .dropdown-divider {
            height: 1px;
            background: rgba(255, 255, 255, 0.08);
            margin: 6px 0;
          }

          .dropdown-logout {
            color: #f87171;
          }

          .dropdown-logout:hover {
            background: rgba(239, 68, 68, 0.15);
            color: #ef4444;
          }

          .navbar-auth-buttons {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .btn-login {
            color: #94a3b8;
            font-weight: 700;
            text-decoration: none;
            font-size: 14px;
            transition: color 0.2s ease;
          }

          .btn-login:hover {
            color: #10b981;
          }

          .btn-register {
            background: #10b981;
            color: #ffffff;
            padding: 8px 18px;
            border-radius: 10px;
            font-weight: 850;
            text-decoration: none;
            font-size: 14px;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
            transition: all 0.2s ease;
          }

          .btn-register:hover {
            background: #059669;
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
          }

          @media (max-width: 768px) {
            .app-navbar {
              padding: 16px 20px;
              flex-direction: row;
              justify-content: space-between;
              align-items: center;
            }

            .app-nav-links {
              display: none;
            }

            .user-avatar-btn .avatar-name {
              display: none;
            }
          }
        `}
      </style>

      <Link to="/" className="app-logo">
        <span className="app-logo-mark">FC</span>
        <span className="app-logo-text">Fitness Coaching</span>
      </Link>

      {/* Main minimal links */}
      <div className="app-nav-links">
        <NavLink to="/" className="app-nav-link" end>
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
        <NavLink to="/articles" className="app-nav-link">
          Articles
        </NavLink>
      </div>

      {/* User Section / Login & Register */}
      <div className="user-section">
        {isLoggedIn ? (
          <div className="user-menu-container" ref={dropdownRef}>
            <button
              type="button"
              className={`user-avatar-btn ${dropdownOpen ? "open" : ""}`}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="avatar-circle">{userInitial}</div>
              <span className="avatar-name">{displayName}</span>
              <span className="avatar-arrow">▼</span>
            </button>

            <div className={`navbar-dropdown ${dropdownOpen ? "open" : ""}`}>
              {/* Dropdown items for CLIENT */}
              {isLoggedIn && !isStaff && !isCoach && (
                <>
                  <Link to="/profile" className="dropdown-item">👤 Profil</Link>
                  <Link to="/messages" className="dropdown-item">💬 Messages</Link>
                  <Link to="/appointments" className="dropdown-item">📅 Rendez-vous</Link>
                  <Link to="/progress" className="dropdown-item">📈 Progression</Link>
                  <Link to="/dashboard" className="dropdown-item">🎒 Mes programmes</Link>
                </>
              )}

              {/* Dropdown items for COACH */}
              {isLoggedIn && isCoach && !isStaff && (
                <>
                  <Link to="/profile" className="dropdown-item">👤 Profil</Link>
                  <Link to="/coach-dashboard" className="dropdown-item">🎒 Mes programmes</Link>
                  <Link to="/coach-dashboard" className="dropdown-item">👥 Mes clients</Link>
                  <Link to="/messages" className="dropdown-item">💬 Messages</Link>
                  <Link to="/appointments" className="dropdown-item">📅 Séances</Link>
                </>
              )}

              {/* Dropdown items for ADMIN */}
              {isLoggedIn && isStaff && (
                <>
                  <Link to="/admin-dashboard" className="dropdown-item">⚙️ Admin Dashboard</Link>
                </>
              )}

              <div className="dropdown-divider"></div>
              <button
                type="button"
                className="dropdown-item dropdown-logout"
                onClick={handleLogout}
              >
                🚪 Déconnexion
              </button>
            </div>
          </div>
        ) : (
          <div className="navbar-auth-buttons">
            <Link to="/login" className="btn-login">
              Connexion
            </Link>
            <Link to="/register" className="btn-register">
              S'inscrire
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
