export default function CoachPreview() {
  const coaches = [
    { id: 1, name: "Coach Ahmed", specialty: "Musculation", price: "200 MAD/mois" },
    { id: 2, name: "Coach Sara", specialty: "Nutrition", price: "250 MAD/mois" },
    { id: 3, name: "Coach Yassine", specialty: "Weight Loss", price: "220 MAD/mois" },
  ];

  return (
    <section style={styles.section}>
      <h2 style={styles.title}>Nos coachs</h2>

      <div style={styles.grid}>
        {coaches.map((coach) => (
          <div key={coach.id} style={styles.card}>
            <h3>{coach.name}</h3>
            <p>{coach.specialty}</p>
            <p><strong>{coach.price}</strong></p>
            <button style={styles.button}>Voir le profil</button>
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
  },
  grid: {
    display: "flex",
    gap: "20px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  card: {
    width: "250px",
    padding: "20px",
    borderRadius: "12px",
    backgroundColor: "white",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },
  button: {
    marginTop: "10px",
    padding: "10px 16px",
    border: "none",
    backgroundColor: "#22c55e",
    color: "white",
    borderRadius: "8px",
    cursor: "pointer",
  },
};