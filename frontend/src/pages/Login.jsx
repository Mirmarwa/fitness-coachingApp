import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/token/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error("Login failed");
      }

      localStorage.setItem("access", data.access);
      localStorage.setItem("username", username);

      if (data.refresh) {
        localStorage.setItem("refresh", data.refresh);
      }

      toast.success("Connexion réussie");
      navigate("/dashboard");
    } catch {
      toast.error("Nom d'utilisateur ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <div style={styles.header}>
          <p style={styles.kicker}>Fitness Coaching</p>
          <h1 style={styles.title}>Connexion</h1>
          <p style={styles.subtitle}>
            Connectez-vous pour accéder à votre tableau de bord et retrouver vos
            programmes achetés.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="username" style={styles.label}>
              Nom d'utilisateur
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Entrez votre nom d'utilisateur"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Entrez votre mot de passe"
              required
              style={styles.input}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {}),
            }}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 18px",
    background:
      "linear-gradient(135deg, #f8fafc 0%, #ecfdf5 52%, #ffffff 100%)",
    color: "#10201c",
    fontFamily:
      'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  card: {
    width: "min(440px, 100%)",
    padding: "34px",
    borderRadius: "24px",
    background: "rgba(255, 255, 255, 0.94)",
    border: "1px solid rgba(15, 118, 110, 0.12)",
    boxShadow: "0 24px 70px rgba(15, 23, 42, 0.12)",
  },
  header: {
    marginBottom: "26px",
    textAlign: "center",
  },
  kicker: {
    margin: "0 0 10px",
    color: "#0f766e",
    fontSize: "13px",
    fontWeight: 900,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  title: {
    margin: 0,
    color: "#0f172a",
    fontSize: "38px",
    lineHeight: 1,
  },
  subtitle: {
    margin: "14px 0 0",
    color: "#52645f",
    fontSize: "15px",
    lineHeight: 1.7,
  },
  form: {
    display: "grid",
    gap: "18px",
  },
  inputGroup: {
    display: "grid",
    gap: "8px",
  },
  label: {
    color: "#0f172a",
    fontSize: "14px",
    fontWeight: 800,
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 15px",
    borderRadius: "14px",
    border: "1px solid #d1fae5",
    background: "#f8fafc",
    color: "#0f172a",
    fontSize: "15px",
    outline: "none",
  },
  button: {
    width: "100%",
    minHeight: "48px",
    marginTop: "6px",
    border: 0,
    borderRadius: "14px",
    background: "#0f766e",
    color: "white",
    boxShadow: "0 16px 32px rgba(15, 118, 110, 0.25)",
    fontSize: "15px",
    fontWeight: 900,
    cursor: "pointer",
  },
  buttonDisabled: {
    opacity: 0.75,
    cursor: "not-allowed",
    boxShadow: "none",
  },
};
