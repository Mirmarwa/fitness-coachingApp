import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={styles.nav}>
      <h2 style={styles.logo}>Fitness Coaching</h2>

      <div style={styles.links}>
        <Link to="/" style={styles.link}>Accueil</Link>
        <Link to="/coaches" style={styles.link}>Coachs</Link>
        <Link to="/login" style={styles.link}>Connexion</Link>
        <Link to="/register" style={styles.link}>Inscription</Link>
        <Link to="/dashboard" style={styles.link}>Dashboard</Link>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 30px",
    backgroundColor: "#222",
    color: "white",
  },
  logo: {
    margin: 0,
  },
  links: {
    display: "flex",
    gap: "20px",
  },
  link: {
    color: "white",
    textDecoration: "none",
    fontWeight: "bold",
  },
};