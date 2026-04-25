import { useEffect, useState } from "react";
import HeroSection from "../components/HeroSection";
import FeatureSection from "../components/FeatureSection";
import CoachPreview from "../components/CoachPreview";
import { Link } from "react-router-dom";

export default function Home() {
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/programs/")
      .then((res) => res.json())
      .then((data) => setPrograms(data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Bienvenue sur Fitness Coaching App</h1>
      <p style={styles.text}>
        Trouvez votre coach, suivez vos programmes sportifs et atteignez vos objectifs.
      </p>

      <div style={styles.buttons}>
        <button style={styles.primary}>Commencer</button>
        <button style={styles.secondary}>Découvrir les coachs</button>
      </div>

      <HeroSection />
      <FeatureSection />
      <CoachPreview />

      {/* 🔥 SECTION PROGRAMMES */}
      <div style={{ marginTop: "40px" }}>
  <h2>Nos Programmes</h2>

  <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
    {programs.map((program) => (
  <div
    key={program.id}
    style={{
      border: "1px solid #ddd",
      padding: "20px",
      borderRadius: "10px",
      width: "250px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    }}
  >
    <h3>{program.title}</h3>
    <p>{program.description}</p>
    <p><strong>{program.duration} jours</strong></p>

    <Link to={`/program/${program.id}`}>
      <button style={{ marginTop: "10px" }}>
        Voir détails
      </button>
    </Link>

  </div>
))}
  </div>
</div>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    padding: "60px 20px",
  },
  title: {
    fontSize: "2.5rem",
    marginBottom: "20px",
  },
  text: {
    fontSize: "1.2rem",
    marginBottom: "30px",
    color: "#555",
  },
  buttons: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
  },
  primary: {
    padding: "12px 24px",
    border: "none",
    backgroundColor: "#28a745",
    color: "white",
    borderRadius: "8px",
    cursor: "pointer",
  },
  secondary: {
    padding: "12px 24px",
    border: "1px solid #28a745",
    backgroundColor: "white",
    color: "#28a745",
    borderRadius: "8px",
    cursor: "pointer",
  },
};