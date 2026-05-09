import { useMemo, useState } from "react";
import CoachCard from "../components/CoachCard";

const coaches = [
  {
    id: 1,
    name: "Coach Ahmed",
    specialty: "Musculation",
    price: "200 MAD/mois",
    rating: 4.9,
    badges: ["Top Coach", "Premium"],
    stats: [
      { label: "Clients accompagnés", value: "120+" },
      { label: "Satisfaction", value: "98%" },
      { label: "Séances", value: "1.200" },
    ],
  },
  {
    id: 2,
    name: "Coach Sara",
    specialty: "Nutrition",
    price: "250 MAD/mois",
    rating: 4.8,
    badges: ["Expert Nutrition", "Premium"],
    stats: [
      { label: "Clients accompagnés", value: "95+" },
      { label: "Satisfaction", value: "96%" },
      { label: "Séances", value: "980" },
    ],
  },
  {
    id: 3,
    name: "Coach Yassine",
    specialty: "Perte de poids",
    price: "220 MAD/mois",
    rating: 4.7,
    badges: ["Coach Bien-être"],
    stats: [
      { label: "Clients accompagnés", value: "110+" },
      { label: "Satisfaction", value: "94%" },
      { label: "Séances", value: "1.050" },
    ],
  },
];

const specialties = ["Tous", "Musculation", "Nutrition", "Perte de poids"];

export default function Coaches() {
  const [selectedSpecialty, setSelectedSpecialty] = useState("Tous");

  const filteredCoaches = useMemo(() => {
    if (selectedSpecialty === "Tous") {
      return coaches;
    }

    return coaches.filter((coach) => coach.specialty === selectedSpecialty);
  }, [selectedSpecialty]);

  return (
    <main className="coaches-page">
      <style>
        {`
          .coaches-page {
            min-height: 100vh;
            padding: 42px 24px 60px;
            background: linear-gradient(180deg, #f8fafc 0%, #ecfdf5 56%, #ffffff 100%);
            color: #0f172a;
            font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }

          .coaches-container {
            width: min(1180px, 100%);
            margin: 0 auto;
          }

          .coaches-hero {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 24px;
            margin-bottom: 32px;
          }

          .coaches-hero h1 {
            margin: 0;
            font-size: clamp(38px, 6vw, 56px);
            line-height: 1.02;
          }

          .coaches-hero p {
            max-width: 660px;
            margin: 18px 0 0;
            color: #475569;
            font-size: 16px;
            line-height: 1.8;
          }

          .filter-panel {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            align-items: center;
            margin-bottom: 26px;
          }

          .filter-label {
            font-size: 14px;
            font-weight: 800;
            color: #0f766e;
            letter-spacing: 0.06em;
            text-transform: uppercase;
          }

          .filter-select {
            min-width: 180px;
            padding: 14px 16px;
            border-radius: 16px;
            border: 1px solid rgba(15, 118, 110, 0.18);
            background: white;
            color: #0f172a;
            font-size: 15px;
            box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
          }

          .coaches-grid {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
            align-items: stretch;
          }

          .empty-state {
            margin-top: 24px;
            padding: 40px 24px;
            border-radius: 24px;
            text-align: center;
            background: white;
            border: 1px dashed rgba(15, 118, 110, 0.24);
            box-shadow: 0 20px 48px rgba(15, 23, 42, 0.06);
          }

          .empty-state h2 {
            margin: 0 0 10px;
            font-size: 24px;
            color: #0f172a;
          }

          .empty-state p {
            margin: 0;
            color: #667085;
            line-height: 1.7;
          }

          @media (max-width: 900px) {
            .coaches-hero {
              flex-direction: column;
              gap: 18px;
            }

            .coaches-grid {
              justify-content: center;
            }
          }

          @media (max-width: 640px) {
            .filter-panel {
              flex-direction: column;
              align-items: stretch;
            }

            .filter-select {
              width: 100%;
            }
          }
        `}
      </style>

      <div className="coaches-container">
        <section className="coaches-hero">
          <div>
            <p className="filter-label">Coachs Premium</p>
            <h1>Nos meilleurs coachs</h1>
            <p>
              Découvrez une sélection de coachs haut de gamme, certifiés et
              spécialisés pour vous accompagner avec un suivi motivant et efficace.
            </p>
          </div>

          <div className="filter-panel">
            <label className="filter-label" htmlFor="specialty">
              Filtrer par spécialité
            </label>
            <select
              id="specialty"
              className="filter-select"
              value={selectedSpecialty}
              onChange={(event) => setSelectedSpecialty(event.target.value)}
            >
              {specialties.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>
          </div>
        </section>

        {filteredCoaches.length === 0 ? (
          <div className="empty-state">
            <h2>Aucun coach trouvé</h2>
            <p>Essayez un autre filtre ou revenez plus tard pour de nouvelles offres.</p>
          </div>
        ) : (
          <div className="coaches-grid">
            {filteredCoaches.map((coach) => (
              <CoachCard
                key={coach.id}
                name={coach.name}
                specialty={coach.specialty}
                price={coach.price}
                rating={coach.rating}
                badges={coach.badges}
                stats={coach.stats}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
