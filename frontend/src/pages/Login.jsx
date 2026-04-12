export default function Login() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.left}>
          <p style={styles.brand}>Fitness Coaching App</p>
          <h1 style={styles.title}>Connexion</h1>
          <p style={styles.subtitle}>
            Connectez-vous pour retrouver votre programme, suivre votre progression
            et accéder à vos coachs fitness et nutrition.
          </p>

          <form style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Adresse e-mail</label>
              <input
                type="email"
                placeholder="Entrez votre e-mail"
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Mot de passe</label>
              <input
                type="password"
                placeholder="Entrez votre mot de passe"
                style={styles.input}
              />
            </div>

            <div style={styles.optionsRow}>
              <label style={styles.remember}>
                <input type="checkbox" />
                <span style={{ marginLeft: "8px" }}>Se souvenir de moi</span>
              </label>

              <a href="#" style={styles.forgotPassword}>
                Mot de passe oublié ?
              </a>
            </div>

            <button type="submit" style={styles.loginButton}>
              Se connecter
            </button>
          </form>

          <p style={styles.registerText}>
            Vous n’avez pas de compte ?{" "}
            <span style={styles.registerLink}>Créer un compte</span>
          </p>
        </div>

        <div style={styles.right}>
          <div style={styles.imageCard}>
            <div style={styles.badge}>Coaching Premium</div>

            <h2 style={styles.rightTitle}>
              Atteignez vos objectifs avec un accompagnement intelligent
            </h2>

            <p style={styles.rightText}>
              Suivi personnalisé, nutrition adaptée et coachs qualifiés pour une
              expérience moderne, motivante et professionnelle.
            </p>

            <div style={styles.stats}>
              <div style={styles.statBox}>
                <h3 style={styles.statNumber}>50+</h3>
                <p style={styles.statLabel}>Coachs</p>
              </div>

              <div style={styles.statBox}>
                <h3 style={styles.statNumber}>100+</h3>
                <p style={styles.statLabel}>Programmes</p>
              </div>

              <div style={styles.statBox}>
                <h3 style={styles.statNumber}>24/7</h3>
                <p style={styles.statLabel}>Suivi</p>
              </div>
            </div>

            <div style={styles.fakeImage}>
              <div style={styles.circle1}></div>
              <div style={styles.circle2}></div>
              <div style={styles.circle3}></div>
              <p style={styles.fakeImageText}>Espace visuel fitness premium</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #eef4ff 0%, #f8fbff 45%, #ffffff 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px 20px",
  },

  container: {
    width: "100%",
    maxWidth: "1150px",
    backgroundColor: "#ffffff",
    borderRadius: "28px",
    boxShadow: "0 20px 60px rgba(37, 99, 235, 0.10)",
    overflow: "hidden",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
  },

  left: {
    padding: "60px 50px",
    backgroundColor: "#ffffff",
  },

  brand: {
    color: "#2563eb",
    fontWeight: "700",
    marginBottom: "12px",
    fontSize: "0.95rem",
    letterSpacing: "0.3px",
  },

  title: {
    fontSize: "2.5rem",
    color: "#0f172a",
    marginBottom: "14px",
    fontWeight: "800",
  },

  subtitle: {
    color: "#64748b",
    lineHeight: "1.7",
    fontSize: "1rem",
    marginBottom: "32px",
    maxWidth: "480px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  label: {
    fontWeight: "600",
    color: "#1e293b",
    fontSize: "0.95rem",
  },

  input: {
    padding: "15px 16px",
    borderRadius: "14px",
    border: "1px solid #dbeafe",
    backgroundColor: "#f8fbff",
    fontSize: "1rem",
    outline: "none",
  },

  optionsRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },

  remember: {
    display: "flex",
    alignItems: "center",
    color: "#475569",
    fontSize: "0.95rem",
  },

  forgotPassword: {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "0.95rem",
  },

  loginButton: {
    marginTop: "8px",
    border: "none",
    borderRadius: "14px",
    padding: "15px 20px",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "white",
    fontSize: "1rem",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 10px 25px rgba(37, 99, 235, 0.25)",
  },

  registerText: {
    marginTop: "24px",
    color: "#64748b",
    fontSize: "0.95rem",
  },

  registerLink: {
    color: "#2563eb",
    fontWeight: "700",
    cursor: "pointer",
  },

  right: {
    background: "linear-gradient(160deg, #0f172a 0%, #1e3a8a 55%, #2563eb 100%)",
    color: "white",
    padding: "50px 40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },

  imageCard: {
    position: "relative",
    zIndex: 2,
    width: "100%",
    maxWidth: "380px",
  },

  badge: {
    display: "inline-block",
    padding: "8px 14px",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: "999px",
    fontSize: "0.9rem",
    marginBottom: "20px",
    backdropFilter: "blur(4px)",
  },

  rightTitle: {
    fontSize: "2rem",
    lineHeight: "1.3",
    marginBottom: "16px",
    fontWeight: "800",
  },

  rightText: {
    color: "rgba(255,255,255,0.82)",
    lineHeight: "1.7",
    marginBottom: "28px",
  },

  stats: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "28px",
  },

  statBox: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: "16px",
    padding: "14px 16px",
    minWidth: "100px",
    backdropFilter: "blur(6px)",
  },

  statNumber: {
    margin: 0,
    fontSize: "1.35rem",
    fontWeight: "800",
  },

  statLabel: {
    margin: "6px 0 0 0",
    color: "rgba(255,255,255,0.78)",
    fontSize: "0.9rem",
  },

  fakeImage: {
    marginTop: "10px",
    height: "220px",
    borderRadius: "24px",
    background: "linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0.06))",
    border: "1px solid rgba(255,255,255,0.15)",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  circle1: {
    position: "absolute",
    width: "160px",
    height: "160px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.10)",
    top: "-20px",
    left: "-20px",
  },

  circle2: {
    position: "absolute",
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.08)",
    bottom: "10px",
    right: "20px",
  },

  circle3: {
    position: "absolute",
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.12)",
    top: "40px",
    right: "60px",
  },

  fakeImageText: {
    position: "relative",
    zIndex: 2,
    fontWeight: "700",
    letterSpacing: "0.3px",
    color: "rgba(255,255,255,0.90)",
  },
};