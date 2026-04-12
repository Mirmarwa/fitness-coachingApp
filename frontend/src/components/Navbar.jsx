import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={styles.nav}>
      <h2 style={styles.logo}>Fitness Coaching</h2>

      <div style={styles.links}>
        <NavLink to="/" style={({ isActive }) => ({
  ...styles.link,
  color: isActive ? "#2563eb" : "white",
})}>
  Accueil
  </NavLink>
    
        <NavLink to="/coaches" style={({ isActive }) => ({
  ...styles.link,
  color: isActive ? "#2563eb" : "white",
})}>
  Coachs
</NavLink>

        <NavLink
  to="/login"
  style={({ isActive }) => ({
    ...styles.link,
    color: isActive ? "#2563eb" : "white",
  })}
>
  Connexion
</NavLink>

        <NavLink
  to="/register"
  style={({ isActive }) => ({
    ...styles.link,
    color: isActive ? "#2563eb" : "white",
  })}
>
  Inscription
</NavLink>

        <NavLink
  to="/dashboard"
  style={({ isActive }) => ({
    ...styles.link,
    color: isActive ? "#2563eb" : "white",
  })}
>
  Dashboard
</NavLink>
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
  cursor: "pointer", // IMPORTANT
}
};