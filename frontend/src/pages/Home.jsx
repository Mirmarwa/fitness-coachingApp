export default function Home() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Bienvenue sur Fitness Coaching App</h1>
      <p style={styles.text}>
        Trouvez votre coach, suivez vos programmes sportifs et atteignez vos objectifs.
      </p>

      <div style={styles.buttons}>
        <button style={styles.primary}>Commencer</button>
        <button style={styles.secondary}>Découvrir les coachs</button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    padding: "60px 20px",
  },
  title: {
    fontSize: "2.5rem",
    marginBottom: "20px",
  },
  text: {
    fontSize: "1.2rem",
    marginBottom: "30px",
    color: "#555",
  },
  buttons: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
  },
  primary: {
    padding: "12px 24px",
    border: "none",
    backgroundColor: "#28a745",
    color: "white",
    borderRadius: "8px",
    cursor: "pointer",
  },
  secondary: {
    padding: "12px 24px",
    border: "1px solid #28a745",
    backgroundColor: "white",
    color: "#28a745",
    borderRadius: "8px",
    cursor: "pointer",
  },
};