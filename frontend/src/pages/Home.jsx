import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { authFetch, API_BASE_URL } from "../services/api";
import ProgramCard from "../components/ProgramCard";

export default function Home() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch(`${API_BASE_URL}/programs/`)
      .then((res) => res.json())
      .then((data) => setPrograms(Array.isArray(data) ? data : []))
      .catch(() => setPrograms([]))
      .finally(() => setLoading(false));
  }, []);

  const visiblePrograms = useMemo(() => programs, [programs]);

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <p style={styles.kicker}>Coaching sportif moderne</p>
          <h1 style={styles.heroTitle}>Fitness Coaching App</h1>
          <p style={styles.heroText}>
            Choisissez votre programme, suivez vos entraînements et avancez vers
            vos objectifs avec une expérience claire, motivante et professionnelle.
          </p>
          <div style={styles.heroActions}>
            <a href="#programmes" style={styles.primaryButton}>
              Voir les programmes
            </a>
            <Link to="/dashboard" style={styles.secondaryButton}>
              Mon dashboard
            </Link>
          </div>
        </div>
      </section>

      <section style={styles.statsBand}>
        <div style={styles.statItem}>
          <strong>3+</strong>
          <span>Objectifs sportifs</span>
        </div>
        <div style={styles.statItem}>
          <strong>100%</strong>
          <span>Plans guidés</span>
        </div>
        <div style={styles.statItem}>
          <strong>24/7</strong>
          <span>Accès aux programmes</span>
        </div>
      </section>

      <section id="programmes" style={styles.section}>
        <div style={styles.sectionHeader}>
          <p style={styles.kicker}>Programmes</p>
          <h2 style={styles.sectionTitle}>Nos Programmes</h2>
          <p style={styles.sectionText}>
            Des plans simples et efficaces pour prendre du muscle, perdre du poids
            ou démarrer correctement.
          </p>
        </div>

        {loading ? (
          <div style={styles.emptyState}>Chargement des programmes...</div>
        ) : visiblePrograms.length === 0 ? (
          <div style={styles.emptyState}>Aucun programme disponible</div>
        ) : (
          <div style={styles.programGrid}>
            {visiblePrograms.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        )}
      </section>

      <section style={styles.featureGrid}>
        <div style={styles.featureCard}>
          <span style={styles.featureIcon}>🏋️</span>
          <h3>Entraînements structurés</h3>
          <p>Des exercices organisés pour savoir exactement quoi faire.</p>
        </div>
        <div style={styles.featureCard}>
          <span style={styles.featureIcon}>🥗</span>
          <h3>Nutrition claire</h3>
          <p>Des plans alimentaires simples pour soutenir vos progrès.</p>
        </div>
        <div style={styles.featureCard}>
          <span style={styles.featureIcon}>📈</span>
          <h3>Progression motivante</h3>
          <p>Un dashboard propre pour retrouver vos achats rapidement.</p>
        </div>
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "40px 24px 80px",
    background: "transparent",
    color: "#f8fafc",
    fontFamily:
      'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  hero: {
    width: "min(1200px, 100%)",
    minHeight: "560px",
    margin: "0 auto 60px",
    display: "flex",
    alignItems: "center",
    borderRadius: "32px",
    overflow: "hidden",
    backgroundImage:
      "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.6) 50%, rgba(16, 185, 129, 0.1) 100%), url(https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1600&q=80)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    border: "1px solid rgba(16, 185, 129, 0.2)",
    boxShadow: "0 25px 60px rgba(0, 0, 0, 0.5)",
  },
  heroContent: {
    maxWidth: "700px",
    padding: "60px",
    color: "white",
  },
  kicker: {
    margin: "0 0 12px",
    color: "#10b981",
    fontSize: "14px",
    fontWeight: 900,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },
  heroTitle: {
    margin: 0,
    fontSize: "clamp(46px, 7vw, 76px)",
    lineHeight: 0.92,
    fontWeight: 900,
    fontFamily: "'Outfit', sans-serif",
    textShadow: "0 4px 15px rgba(0, 0, 0, 0.6)",
  },
  heroText: {
    margin: "24px 0 32px",
    color: "#cbd5e1",
    fontSize: "19px",
    lineHeight: 1.7,
  },
  heroActions: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
  },
  primaryButton: {
    padding: "16px 26px",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "white",
    boxShadow: "0 10px 25px rgba(16, 185, 129, 0.35)",
    fontWeight: 800,
    fontSize: "15px",
    textDecoration: "none",
    transition: "all 0.2s ease",
  },
  secondaryButton: {
    padding: "16px 26px",
    borderRadius: "16px",
    background: "rgba(255, 255, 255, 0.06)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    color: "white",
    fontWeight: 800,
    fontSize: "15px",
    textDecoration: "none",
    transition: "all 0.2s ease",
  },
  statsBand: {
    width: "min(1020px, calc(100% - 28px))",
    margin: "-48px auto 60px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    position: "relative",
    zIndex: 2,
  },
  statItem: {
    padding: "24px",
    borderRadius: "24px",
    background: "rgba(31, 41, 55, 0.75)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(16, 185, 129, 0.2)",
    boxShadow: "0 15px 35px rgba(0, 0, 0, 0.3)",
    textAlign: "center",
  },
  section: {
    width: "min(1200px, 100%)",
    margin: "0 auto 48px",
  },
  sectionHeader: {
    maxWidth: "700px",
    marginBottom: "32px",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "clamp(34px, 5vw, 48px)",
    fontWeight: 800,
    fontFamily: "'Outfit', sans-serif",
  },
  sectionText: {
    margin: "14px 0 0",
    color: "#94a3b8",
    fontSize: "16px",
    lineHeight: 1.7,
  },
  programGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "28px",
  },
  programCard: {
    overflow: "hidden",
    borderRadius: "22px",
    background: "white",
    border: "1px solid rgba(15, 118, 110, 0.12)",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
  },
  imageBox: {
    aspectRatio: "16 / 10",
    overflow: "hidden",
    background: "#dcfce7",
  },
  programImage: {
    width: "100%",
    height: "100%",
    display: "block",
    objectFit: "cover",
  },
  programContent: {
    padding: "22px",
  },
  programTitle: {
    margin: "0 0 10px",
    fontSize: "22px",
  },
  programDescription: {
    minHeight: "70px",
    margin: "0 0 18px",
    color: "#52645f",
    lineHeight: 1.6,
  },
  programFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },
  price: {
    color: "#0f766e",
    fontSize: "18px",
  },
  cardButton: {
    padding: "11px 16px",
    borderRadius: "13px",
    background: "#0f766e",
    color: "white",
    fontWeight: 900,
    textDecoration: "none",
  },
  featureGrid: {
    width: "min(1160px, 100%)",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "18px",
  },
  featureCard: {
    padding: "24px",
    borderRadius: "20px",
    background: "white",
    border: "1px solid rgba(15, 118, 110, 0.12)",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.07)",
  },
  featureIcon: {
    display: "inline-grid",
    placeItems: "center",
    width: "48px",
    height: "48px",
    marginBottom: "12px",
    borderRadius: "15px",
    background: "#dcfce7",
    fontSize: "24px",
  },
  emptyState: {
    padding: "36px",
    borderRadius: "22px",
    background: "white",
    border: "1px dashed rgba(15, 118, 110, 0.35)",
    color: "#64748b",
    textAlign: "center",
  },
};
