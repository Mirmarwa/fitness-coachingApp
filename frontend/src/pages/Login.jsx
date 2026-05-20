import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { API_BASE_URL, BACKEND_BASE_URL, getProfile } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  applyUserSession,
  getPostLoginPath,
  parseTokenPayload,
  userFromTokenPayload,
} from "../utils/authSession";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/token/`, {
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

      let profile = null;
      try {
        profile = await getProfile();
      } catch {
        profile = userFromTokenPayload(parseTokenPayload(data.access));
      }

      if (profile) {
        applyUserSession(profile);
        setUser(profile);
      }

      toast.success("Connexion réussie");
      navigate(getPostLoginPath(profile));
    } catch {
      toast.error("Nom d'utilisateur ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <center>  
        <div >
          <p style={styles.kicker}>Fitness Coaching</p>
          <h1 style={styles.title}>Connexion</h1>
          <p style={styles.subtitle}>
            Connectez-vous pour accéder à votre espace selon votre rôle.
          </p>
        </div>
        </center>

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

        <p style={styles.bottomText}>
          Vous n'avez pas de compte ?{" "}
          <Link to="/register" style={styles.link}>
            Register
          </Link>
        </p>
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
    background: "linear-gradient(180deg, #06090d 0%, #0b131d 55%, #111924 100%)",
    color: "#e6f6ef",
    fontFamily:
      'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  card: {
    width: "min(480px, 100%)",
    padding: "36px",
    borderRadius: "28px",
    background: "rgba(12, 18, 28, 0.88)",
    border: "1px solid rgba(16, 185, 129, 0.14)",
    boxShadow: "0 32px 80px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255,255,255,0.04)",
    backdropFilter: "blur(18px)",
  },
  header: {
    marginBottom: "26px",
    textAlign: "center",
  },
  kicker: {
    margin: "0 0 10px",
    color: "#a6f1d9",
    fontSize: "13px",
    fontWeight: 900,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },
  title: {
    margin: 0,
    color: "#f4fff9",
    fontSize: "40px",
    lineHeight: 1.04,
  },
  subtitle: {
    margin: "14px 0 0",
    color: "#9fb1b0",
    fontSize: "15px",
    lineHeight: 1.9,
  },
  form: {
    display: "grid",
    gap: "18px",
  },
  inputGroup: {
    display: "grid",
    gap: "10px",
  },
  label: {
    color: "#d8f6e3",
    fontSize: "14px",
    fontWeight: 700,
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "16px 18px",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    color: "#eef8f3",
    fontSize: "15px",
    outline: "none",
    boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.25)",
  },
  button: {
    width: "100%",
    minHeight: "50px",
    marginTop: "6px",
    border: 0,
    borderRadius: "16px",
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "white",
    boxShadow: "0 16px 35px rgba(16, 185, 129, 0.24)",
    fontSize: "15px",
    fontWeight: 900,
    cursor: "pointer",
  },
  buttonDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
    boxShadow: "none",
  },
  bottomText: {
    marginTop: "18px",
    textAlign: "center",
    color: "#9fb1b0",
    fontSize: "14px",
  },
  link: {
    color: "#9ff2c9",
    fontWeight: 900,
    textDecoration: "none",
  },
};
