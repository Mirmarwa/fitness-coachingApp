import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BACKEND_BASE_URL } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { applyUserSession, getPostLoginPath } from "../utils/authSession";

const getFieldError = (data) => {
  if (!data) return "Erreur lors de l'inscription.";

  const value =
    data.detail ||
    data.error ||
    data.non_field_errors ||
    data.password ||
    data.password_confirm ||
    data.username ||
    data.email ||
    data.role;

  if (Array.isArray(value)) return value.join(" ");
  if (typeof value === "object") return Object.values(value).flat().join(" ");
  return value || "Erreur lors de l'inscription.";
};

export default function Register() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("client");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
          password_confirm: confirmPassword,
          role,
        }),
      });

      const data = await response.json().catch(() => null);

      if (response.ok) {
        localStorage.removeItem("onboarding");
        localStorage.removeItem("onboarding_program");
        localStorage.removeItem("onboarding_data");

        if (data?.access && data?.refresh && data?.user) {
          localStorage.setItem("access", data.access);
          localStorage.setItem("refresh", data.refresh);
          applyUserSession(data.user);
          setUser(data.user);
          setSuccess("Inscription réussie ! Vous êtes maintenant connecté.");
          setTimeout(() => navigate(getPostLoginPath(data.user)), 800);
          return;
        }

        setSuccess("Compte créé avec succès. Connectez-vous pour continuer.");
        setTimeout(() => navigate("/login"), 900);
      } else {
        setError(getFieldError(data));
      }
    } catch {
      setError("Impossible de se connecter au serveur. Réessayez plus tard.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <p style={styles.kicker}>Fitness Coaching</p>
          <h2 style={styles.title}>Inscription</h2>
          <p style={styles.subtitle}>Créez votre compte et accédez à votre espace premium personnalisé.</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="Username"
            style={styles.input}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <select
            style={styles.input}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="client">Client</option>
            <option value="coach">Coach</option>
          </select>
          <input
            type="password"
            placeholder="Password"
            style={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            style={styles.input}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Inscription..." : "S'inscrire"}
          </button>
        </form>

        <p style={styles.text}>
          Vous avez déjà un compte ?{" "}
          <Link to="/login" style={styles.link}>
            Connexion
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "30px 18px",
    background: "linear-gradient(180deg, #06090d 0%, #0b131d 60%, #111924 100%)",
    color: "#e6f6ef",
    fontFamily:
      'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  card: {
    background: "rgba(12, 18, 28, 0.92)",
    padding: "42px 36px",
    borderRadius: "28px",
    width: "min(460px, 100%)",
    boxShadow: "0 32px 90px rgba(0,0,0,0.5)",
    border: "1px solid rgba(16, 185, 129, 0.16)",
    textAlign: "center",
    backdropFilter: "blur(18px)",
  },
  title: {
    marginBottom: "10px",
    color: "#f4fff9",
    fontSize: "34px",
    letterSpacing: "-0.03em",
  },
  header: {
    marginBottom: "28px",
    textAlign: "center",
  },
  kicker: {
    margin: "0 0 10px",
    color: "#9ff2c9",
    fontSize: "12px",
    fontWeight: 900,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
  },
  subtitle: {
    margin: "0",
    color: "#9fb1b0",
    fontSize: "15px",
    lineHeight: 1.8,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  input: {
    width: "100%",
    padding: "16px 18px",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.05)",
    color: "#eef8f3",
    fontSize: "15px",
    outline: "none",
    boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.24)",
  },
  button: {
    padding: "14px 18px",
    borderRadius: "16px",
    border: "none",
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "white",
    fontWeight: "900",
    letterSpacing: "0.01em",
    cursor: "pointer",
    boxShadow: "0 18px 36px rgba(16, 185, 129, 0.24)",
  },
  text: {
    marginTop: "18px",
    color: "#9fb1b0",
    fontSize: "14px",
  },
  link: {
    color: "#9ff2c9",
    textDecoration: "none",
    fontWeight: "900",
  },
  error: {
    marginBottom: "15px",
    color: "#fee2e2",
    backgroundColor: "rgba(248, 113, 113, 0.18)",
    padding: "12px 14px",
    borderRadius: "14px",
    border: "1px solid rgba(248, 113, 113, 0.25)",
  },
  success: {
    marginBottom: "15px",
    color: "#dcfce7",
    backgroundColor: "rgba(16, 185, 129, 0.18)",
    padding: "12px 14px",
    borderRadius: "14px",
    border: "1px solid rgba(16, 185, 129, 0.25)",
  },
};
