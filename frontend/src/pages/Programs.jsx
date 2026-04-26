import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

const MOCK_PROGRAMS = [
  {
    id: 1,
    title: "Programme Prise de Masse",
    description:
      "Developpez votre force et votre volume musculaire avec un plan clair et progressif.",
    price: 199,
    image:
      "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1200&q=80",
    exercises: [
      { id: 1, name: "Developpe couche", sets: 4, reps: 10 },
      { id: 2, name: "Squat", sets: 4, reps: 8 },
    ],
    nutrition_plans: [{ id: 1, title: "Menu prise de masse", calories: 850 }],
  },
  {
    id: 2,
    title: "Programme Perte de Poids",
    description:
      "Brulez les graisses avec des seances dynamiques et une nutrition simple.",
    price: 149,
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80",
    exercises: [
      { id: 1, name: "Circuit cardio", sets: 5, reps: 12 },
      { id: 2, name: "Fentes marchees", sets: 4, reps: 14 },
    ],
    nutrition_plans: [{ id: 1, title: "Menu equilibre", calories: 520 }],
  },
  {
    id: 3,
    title: "Programme Debutant Full Body",
    description:
      "Apprenez les bases et construisez une routine complete, simple et motivante.",
    price: 99,
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80",
    exercises: [
      { id: 1, name: "Pompes inclinees", sets: 3, reps: 10 },
      { id: 2, name: "Goblet squat", sets: 3, reps: 12 },
    ],
    nutrition_plans: [{ id: 1, title: "Plan decouverte", calories: 580 }],
  },
];

const FALLBACK_IMAGE = MOCK_PROGRAMS[0].image;

export default function Programs() {
  const [programs, setPrograms] = useState([]);
  const [purchasedIds, setPurchasedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPrograms = async () => {
      try {
        const programsResponse = await fetch(`${API_URL}/api/programs/`);
        const programsData = await programsResponse.json();

        setPrograms(Array.isArray(programsData) ? programsData : []);

        try {
          const paymentsResponse = await fetch(`${API_URL}/api/payments/my/`);
          const paymentsData = await paymentsResponse.json();
          setPurchasedIds(paymentsData.map((payment) => payment.program));
        } catch {
          setPurchasedIds([]);
        }
      } catch {
        setPrograms([]);
      } finally {
        setLoading(false);
      }
    };

    loadPrograms();
  }, []);

  const visiblePrograms = useMemo(
    () => (programs.length > 0 ? programs : MOCK_PROGRAMS),
    [programs]
  );

  const getImageUrl = (image) => {
    if (!image || typeof image !== "string") return FALLBACK_IMAGE;
    if (image.startsWith("http")) return image;
    return `${API_URL}${image}`;
  };

  const getPrice = (program) => Number(program.price || program.amount || 100);

  const getShortDescription = (description) => {
    if (!description) {
      return "Un programme fitness clair, motivant et facile a suivre.";
    }

    return description.length > 115 ? `${description.slice(0, 115)}...` : description;
  };

  return (
    <main className="programs-page">
      <style>
        {`
          .programs-page {
            min-height: 100vh;
            padding: 42px 24px 56px;
            background: linear-gradient(135deg, #f8fafc 0%, #ecfdf5 52%, #ffffff 100%);
            color: #10201c;
            font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }

          .programs-container {
            width: min(1160px, 100%);
            margin: 0 auto;
          }

          .programs-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            gap: 24px;
            margin-bottom: 28px;
          }

          .programs-kicker {
            margin: 0 0 10px;
            color: #0f766e;
            font-size: 13px;
            font-weight: 900;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          .programs-title {
            margin: 0;
            font-size: clamp(34px, 6vw, 54px);
            line-height: 1;
          }

          .programs-text {
            max-width: 650px;
            margin: 14px 0 0;
            color: #52645f;
            font-size: 16px;
            line-height: 1.7;
          }

          .programs-count {
            min-width: 180px;
            padding: 20px;
            border-radius: 20px;
            background: #ffffff;
            border: 1px solid rgba(15, 118, 110, 0.12);
            box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
          }

          .programs-count strong {
            display: block;
            color: #0f766e;
            font-size: 38px;
            line-height: 1;
          }

          .programs-count span {
            display: block;
            margin-top: 8px;
            color: #64748b;
            font-size: 14px;
            font-weight: 800;
          }

          .program-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 24px;
          }

          .program-card {
            overflow: hidden;
            border-radius: 22px;
            background: white;
            border: 1px solid rgba(15, 118, 110, 0.12);
            box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
            transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
          }

          .program-card:hover {
            transform: translateY(-6px) scale(1.01);
            border-color: rgba(20, 184, 166, 0.34);
            box-shadow: 0 26px 62px rgba(15, 23, 42, 0.14);
          }

          .program-image-box {
            position: relative;
            aspect-ratio: 16 / 10;
            overflow: hidden;
            background: #dcfce7;
          }

          .program-image {
            width: 100%;
            height: 100%;
            display: block;
            object-fit: cover;
            transition: transform 220ms ease;
          }

          .program-card:hover .program-image {
            transform: scale(1.04);
          }

          .paid-badge {
            position: absolute;
            top: 14px;
            right: 14px;
            padding: 8px 12px;
            border-radius: 999px;
            background: rgba(220, 252, 231, 0.95);
            color: #166534;
            box-shadow: 0 10px 22px rgba(22, 101, 52, 0.16);
            font-size: 13px;
            font-weight: 900;
          }

          .program-content {
            padding: 22px;
          }

          .program-title {
            margin: 0 0 10px;
            color: #0f172a;
            font-size: 22px;
            line-height: 1.25;
          }

          .program-description {
            min-height: 72px;
            margin: 0 0 18px;
            color: #52645f;
            font-size: 15px;
            line-height: 1.6;
          }

          .program-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
          }

          .program-price {
            color: #0f766e;
            font-size: 18px;
            font-weight: 900;
          }

          .program-button {
            padding: 11px 16px;
            border-radius: 13px;
            background: #0f766e;
            color: white;
            font-weight: 900;
            text-decoration: none;
            transition: transform 160ms ease, background 160ms ease, box-shadow 160ms ease;
          }

          .program-button:hover {
            transform: translateY(-2px);
            background: #115e59;
            box-shadow: 0 14px 28px rgba(15, 118, 110, 0.22);
          }

          .empty-state {
            padding: 42px 24px;
            border-radius: 22px;
            background: white;
            border: 1px dashed rgba(15, 118, 110, 0.35);
            box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
            color: #64748b;
            text-align: center;
          }

          @media (max-width: 760px) {
            .programs-page {
              padding: 28px 16px 42px;
            }

            .programs-header {
              align-items: stretch;
              flex-direction: column;
            }

            .programs-count {
              min-width: 0;
            }
          }
        `}
      </style>

      <div className="programs-container">
        <header className="programs-header">
          <div>
            <p className="programs-kicker">Programmes fitness</p>
            <h1 className="programs-title">Tous les programmes</h1>
            <p className="programs-text">
              Choisissez un programme adapte a votre objectif et accedez a une
              experience simple, claire et motivante.
            </p>
          </div>

          <div className="programs-count">
            <strong>{loading ? "..." : visiblePrograms.length}</strong>
            <span>Programmes disponibles</span>
          </div>
        </header>

        {loading ? (
          <div className="empty-state">Chargement des programmes...</div>
        ) : visiblePrograms.length === 0 ? (
          <div className="empty-state">Aucun programme disponible</div>
        ) : (
          <section className="program-grid">
            {visiblePrograms.map((program) => {
              const isPaid = purchasedIds.includes(program.id);

              return (
                <article className="program-card" key={program.id}>
                  <div className="program-image-box">
                    <img
                      className="program-image"
                      src={getImageUrl(program.image)}
                      alt={program.title}
                      onError={(event) => {
                        event.currentTarget.src = FALLBACK_IMAGE;
                      }}
                    />
                    {isPaid && <span className="paid-badge">✔️ Payé</span>}
                  </div>

                  <div className="program-content">
                    <h3 className="program-title">{program.title}</h3>
                    <p className="program-description">
                      {getShortDescription(program.description)}
                    </p>

                    <div className="program-footer">
                      <strong className="program-price">
                        {getPrice(program).toFixed(2)} DH
                      </strong>
                      <Link className="program-button" to={`/program/${program.id}`}>
                        Voir
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
