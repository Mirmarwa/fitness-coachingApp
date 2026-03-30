import CoachCard from "../components/CoachCard";

export default function Coaches() {
  const coaches = [
    { id: 1, name: "Coach Ahmed", specialty: "Musculation", price: "200 MAD/mois" },
    { id: 2, name: "Coach Sara", specialty: "Nutrition", price: "250 MAD/mois" },
    { id: 3, name: "Coach Yassine", specialty: "Perte de poids", price: "220 MAD/mois" },
  ];

  return (
    <div>
      <h1>Nos coachs</h1>
      <div style={styles.grid}>
        {coaches.map((coach) => (
          <CoachCard
            key={coach.id}
            name={coach.name}
            specialty={coach.specialty}
            price={coach.price}
          />
        ))}
      </div>
    </div>
  );
}

const styles = {
  grid: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
    marginTop: "20px",
  },
};