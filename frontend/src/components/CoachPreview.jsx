import { useState, useEffect } from "react";
import { API_BASE_URL } from "../services/api";

export default function CoachPreview() {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCoaches = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/coaches/`);
        if (response.ok) {
          const data = await response.json();
          const limitedCoaches = Array.isArray(data) ? data.slice(0, 3) : [];
          setCoaches(limitedCoaches);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des coachs:", error);
        setCoaches([]);
      } finally {
        setLoading(false);
      }
    };

    loadCoaches();
  }, []);

  if (loading) {
    return (
      <section style={styles.section}>
        <h2 style={styles.title}>Nos coachs</h2>
        <div style={styles.loadingMessage}>Chargement...</div>
      </section>
    );
  }

  if (coaches.length === 0) {
    return (
      <section style={styles.section}>
        <h2 style={styles.title}>Nos coachs</h2>
        <div style={styles.loadingMessage}>Aucun coach disponible pour le moment.</div>
      </section>
    );
  }

  return (
    <section style={styles.section}>
      <h2 style={styles.title}>Nos coachs</h2>
      <div style={styles.grid}>
        {coaches.map((coach) => (
          <div key={coach.id} style={styles.card} className="card">
            <div style={{display:'flex', alignItems:'center', gap:12}}>
              <div style={styles.avatar} aria-hidden>👤</div>
              <div style={{flex:1}}>
                <h3 style={styles.cardTitle}>{coach.username || "Coach"}</h3>
                <p style={styles.cardSpecialty}>{coach.specialty || "Spécialité non renseignée"}</p>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={styles.price}>{coach.price > 0 ? `${coach.price} MAD` : "Gratuit"}</div>
                <div style={styles.cardExp}>{coach.experience} ans</div>
              </div>
            </div>

            <div style={{marginTop:12}}>
              <button style={styles.button}>Voir le profil</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const styles = {
  section: {
    padding: "60px 20px",
    textAlign: "center",
  },
  title: {
    fontSize: "2rem",
    marginBottom: "30px",
    color: "#0f172a",
  },
  loadingMessage: {
    color: "#64748b",
    fontSize: "1.1rem",
  },
  grid: {
    display: "flex",
    gap: "20px",
    justifyContent: "center",
    flexWrap: "wrap",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  card: {
    width: "260px",
    padding: "18px",
    borderRadius: "16px",
    background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
    border: "1px solid rgba(16,185,129,0.06)",
    boxShadow: "0 18px 48px rgba(2,6,23,0.6)",
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 12,
    display: 'grid',
    placeItems: 'center',
    background: 'linear-gradient(135deg, rgba(16,185,129,0.14), rgba(6,95,70,0.08))',
    color: '#e6f6ef',
    fontSize: 20,
  },
  cardTitle: {
    margin: "0 0 6px 0",
    fontSize: "1.05rem",
    color: "#e6eef0",
    fontWeight: 900,
  },
  cardSpecialty: {
    margin: "0",
    color: "#9fb1b0",
    fontSize: "0.9rem",
  },
  price: {
    color: '#bff7e6',
    fontWeight: 800,
    fontSize: '0.95rem'
  },
  cardExp: {
    marginTop: 6,
    color: "#94a3b8",
    fontSize: "0.82rem",
  },
  button: {
    width: "100%",
    marginTop: "6px",
    padding: "10px 14px",
    border: "none",
    background: "linear-gradient(135deg,#10b981,#059669)",
    color: "white",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "800",
    transition: "transform 180ms ease, box-shadow 180ms ease",
    boxShadow: '0 10px 30px rgba(16,185,129,0.12)'
  },
};