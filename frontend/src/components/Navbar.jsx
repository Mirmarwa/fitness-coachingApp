import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  const getLinkStyle = ({ isActive }) => ({
    ...styles.link,
    ...(isActive ? styles.activeLink : {}),
  });

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>
        <span style={styles.logoMark}>FC</span>
        <span>Fitness Coaching</span>
      </Link>

      <div style={styles.links}>
        <NavLink to="/" style={getLinkStyle}>
          Accueil
        </NavLink>
        <NavLink to="/programmes" style={getLinkStyle}>
          Programmes
        </NavLink>
        <NavLink to="/dashboard" style={getLinkStyle}>
          Dashboard
        </NavLink>
        <NavLink to="/login" style={getLinkStyle}>
          Connexion
        </NavLink>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 20,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    padding: "16px 30px",
    background: "rgba(255, 255, 255, 0.92)",
    borderBottom: "1px solid rgba(15, 118, 110, 0.12)",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
    backdropFilter: "blur(14px)",
  },
  logo: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    color: "#0f172a",
    fontSize: "18px",
    fontWeight: 900,
    textDecoration: "none",
    whiteSpace: "nowrap",
  },
  logoMark: {
    display: "grid",
    placeItems: "center",
    width: "38px",
    height: "38px",
    borderRadius: "14px",
    background: "#0f766e",
    color: "white",
    fontSize: "14px",
    boxShadow: "0 12px 24px rgba(15, 118, 110, 0.22)",
  },
  links: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "8px",
    flexWrap: "wrap",
  },
  link: {
    padding: "10px 13px",
    borderRadius: "999px",
    color: "#475569",
    fontSize: "14px",
    fontWeight: 800,
    textDecoration: "none",
    transition: "background 160ms ease, color 160ms ease, transform 160ms ease",
  },
  activeLink: {
    background: "#dcfce7",
    color: "#166534",
  },
};
