import { Link } from "react-router-dom";
export default function CoachCard({ coach }) {
  if (!coach) return null;

  const {
    username = "Non renseigné",
    email = "Non renseigné",
    specialty = "Aucune spécialité",
    experience = 0,
    description = "Aucune description",
    price = 0,
  } = coach;

  return (
    <div style={styles.card} className="coach-card card">
      <div style={styles.topRow}>
        <div>
          <h3 style={styles.title}>{username}</h3>
          <p style={styles.specialty}>{specialty || "Non renseigné"}</p>
        </div>
        <span style={styles.price}>{price > 0 ? `${price} MAD` : "Gratuit"}</span>
      </div>

      <div style={styles.infoRow}>
        <span style={styles.infoLabel}>Email:</span>
        <span style={styles.infoValue}>{email}</span>
      </div>

      <div style={styles.infoRow}>
        <span style={styles.infoLabel}>Expérience:</span>
        <span style={styles.infoValue}>{experience} ans</span>
      </div>

      <div style={styles.descriptionBox}>
        <span style={styles.descriptionLabel}>À propos:</span>
        <p style={styles.descriptionText}>
          {description || "Aucune description"}
        </p>
      </div>

      <Link to={`/coach/${coach.id}`}>
  <button style={styles.button}>
    Voir le profil
  </button>
</Link>
    </div>
  );
}

const styles = {
  card: {
    display: "grid",
    gap: "14px",
    padding: "22px",
    borderRadius: "20px",
    background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
    border: "1px solid rgba(16,185,129,0.06)",
    boxShadow: "0 20px 50px rgba(2,6,23,0.6)",
    minWidth: "260px",
    flex: "1 1 260px",
    transition: "transform 320ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 320ms ease",
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "center",
  },
  title: {
    margin: 0,
    fontSize: "18px",
    color: "#e6eef0",
    fontWeight: 900,
  },
  specialty: {
    margin: "8px 0 0",
    color: "#a6b3b9",
    fontSize: "13px",
  },
  price: {
    padding: "8px 12px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(6,95,70,0.06))",
    color: "#dff8ef",
    fontWeight: 800,
    fontSize: "13px",
    whiteSpace: "nowrap",
    border: "1px solid rgba(16,185,129,0.06)",
  },
  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
  },
  infoLabel: {
    fontWeight: 700,
    color: "#10b981",
    minWidth: "90px",
  },
  infoValue: {
    color: "#b6c6cd",
  },
  descriptionBox: {
    display: "grid",
    gap: "8px",
    padding: "12px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.02)",
  },
  descriptionLabel: {
    fontWeight: 700,
    color: "#10b981",
    fontSize: "13px",
  },
  descriptionText: {
    margin: 0,
    color: "#a6b3b9",
    fontSize: "13px",
    lineHeight: "1.5",
  },
  button: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg,#10b981,#059669)",
    color: "white",
    fontWeight: 800,
    cursor: "pointer",
    transition: "transform 160ms ease, box-shadow 160ms ease",
    boxShadow: "0 10px 30px rgba(16,185,129,0.12)",
  },
};