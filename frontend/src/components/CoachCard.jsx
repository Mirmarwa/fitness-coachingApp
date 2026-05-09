export default function CoachCard({ name, specialty, price, rating, badges = [], stats = [] }) {
  const stars = Array.from({ length: 5 }, (_, index) => index < Math.round(rating) ? "★" : "☆").join("");

  return (
    <div style={styles.card}>
      <div style={styles.topRow}>
        <div>
          <h3 style={styles.title}>{name}</h3>
          <p style={styles.specialty}>{specialty}</p>
        </div>
        <span style={styles.price}>{price}</span>
      </div>

      <div style={styles.ratingRow}>
        <span style={styles.stars}>{stars}</span>
        <span style={styles.ratingValue}>{rating.toFixed(1)}</span>
      </div>

      <div style={styles.badgeRow}>
        {badges.map((badge) => (
          <span key={badge} style={styles.badge}>
            {badge}
          </span>
        ))}
      </div>

      <div style={styles.statsGrid}>
        {stats.map((item) => (
          <div key={item.label} style={styles.statItem}>
            <span style={styles.statLabel}>{item.label}</span>
            <span style={styles.statValue}>{item.value}</span>
          </div>
        ))}
      </div>

      <button style={styles.button}>Voir le profil</button>
    </div>
  );
}

const styles = {
  card: {
    display: "grid",
    gap: "18px",
    padding: "24px",
    borderRadius: "28px",
    background: "linear-gradient(180deg, #ffffff 0%, #f8fdfb 100%)",
    border: "1px solid rgba(15, 118, 110, 0.14)",
    boxShadow: "0 24px 60px rgba(15, 23, 42, 0.08)",
    minWidth: "280px",
    flex: "1 1 280px",
    transition: "transform 180ms ease, box-shadow 180ms ease",
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "flex-start",
  },
  title: {
    margin: 0,
    fontSize: "20px",
    color: "#0f172a",
  },
  specialty: {
    margin: "8px 0 0",
    color: "#475569",
    fontSize: "14px",
  },
  price: {
    padding: "8px 14px",
    borderRadius: "999px",
    background: "#dcfce7",
    color: "#166534",
    fontWeight: 700,
    fontSize: "14px",
    whiteSpace: "nowrap",
  },
  ratingRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  stars: {
    color: "#f59e0b",
    fontSize: "18px",
    lineHeight: 1,
  },
  ratingValue: {
    color: "#0f766e",
    fontWeight: 700,
  },
  badgeRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },
  badge: {
    padding: "8px 12px",
    borderRadius: "999px",
    background: "#ecfdf5",
    color: "#166534",
    fontSize: "12px",
    fontWeight: 700,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "12px",
  },
  statItem: {
    display: "grid",
    gap: "4px",
    padding: "14px",
    borderRadius: "18px",
    background: "#f8fafc",
  },
  statLabel: {
    fontSize: "12px",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  statValue: {
    fontWeight: 900,
    color: "#0f172a",
  },
  button: {
    width: "100%",
    padding: "14px 18px",
    borderRadius: "14px",
    border: "none",
    background: "#0f766e",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
    transition: "transform 160ms ease, background 160ms ease",
  },
};