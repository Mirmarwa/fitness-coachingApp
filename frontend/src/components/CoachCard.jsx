export default function CoachCard({ name, specialty, price }) {
  return (
    <div style={styles.card}>
      <h3>{name}</h3>
      <p><strong>Spécialité :</strong> {specialty}</p>
      <p><strong>Tarif :</strong> {price}</p>
      <button style={styles.button}>Voir plus</button>
    </div>
  );
}

const styles = {
  card: {
    border: "1px solid #ddd",
    borderRadius: "12px",
    padding: "20px",
    width: "250px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    backgroundColor: "white",
  },
  button: {
    marginTop: "10px",
    padding: "10px 16px",
    border: "none",
    backgroundColor: "#28a745",
    color: "white",
    borderRadius: "8px",
    cursor: "pointer",
  },
};