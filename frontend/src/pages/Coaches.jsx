import { useEffect, useMemo, useState } from "react";
import CoachCard from "../components/CoachCard";
import { API_BASE_URL } from "../services/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getPostLoginPath } from "../utils/authSession";

export default function Coaches() {
  const navigate = useNavigate();
  const { user, loading: authLoading, isCoach, isStaff } = useAuth();
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState("Tous");

  useEffect(() => {
    if (authLoading) return;
    if (user && (isCoach || isStaff)) {
      navigate(getPostLoginPath(user), { replace: true });
    }
  }, [authLoading, user, isCoach, isStaff, navigate]);

  useEffect(() => {
    const loadCoaches = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/coaches/`);
        if (!response.ok) {
          throw new Error("Erreur lors du chargement des coachs");
        }
        const data = await response.json();
        setCoaches(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
        toast.error("Impossible de charger les coachs");
        setCoaches([]);
      } finally {
        setLoading(false);
      }
    };

    loadCoaches();
  }, []);

  const uniqueSpecialties = useMemo(() => {
    const specialties = new Set(coaches.map((c) => c.specialty).filter(Boolean));
    return ["Tous", ...Array.from(specialties).sort()];
  }, [coaches]);

  const filteredCoaches = useMemo(() => {
    if (selectedSpecialty === "Tous") {
      return coaches;
    }
    return coaches.filter((coach) => coach.specialty === selectedSpecialty);
  }, [coaches, selectedSpecialty]);

  return (
    <main className="coaches-page">
      <style>
        {`
          .coaches-page {
            min-height: 100vh;
            padding: 42px 24px 60px;
            background: radial-gradient(circle at top right, rgba(16, 185, 129, 0.12), transparent 24%),
              linear-gradient(180deg, #050a11 0%, #0b121d 42%, #111821 100%);
            color: #eef7f1;
            font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }

          .coaches-container {
            width: min(1200px, 100%);
            margin: 0 auto;
          }

          .coaches-hero {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 24px;
            margin-bottom: 32px;
            padding: 28px;
            border-radius: 28px;
            background: rgba(12, 18, 28, 0.94);
            border: 1px solid rgba(16, 185, 129, 0.16);
            box-shadow: 0 32px 90px rgba(0, 0, 0, 0.45);
          }

          .coaches-hero h1 {
            margin: 0;
            font-size: clamp(38px, 6vw, 56px);
            line-height: 1.02;
            color: #f4fff9;
          }

          .coaches-hero p {
            max-width: 660px;
            margin: 18px 0 0;
            color: #9fb1b0;
            font-size: 16px;
            line-height: 1.8;
          }

          .filter-panel {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            align-items: center;
            margin-bottom: 26px;
            padding: 24px;
            border-radius: 24px;
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.06);
          }

          .filter-label {
            font-size: 13px;
            font-weight: 900;
            color: #9ff2c9;
            letter-spacing: 0.18em;
            text-transform: uppercase;
          }

          .filter-select {
            min-width: 180px;
            padding: 14px 18px;
            border-radius: 16px;
            border: 1px solid rgba(255,255,255,0.08);
            background: rgba(255,255,255,0.05);
            color: #eef7f1;
            font-size: 15px;
            box-shadow: inset 0 1px 2px rgba(0,0,0,0.18);
          }

          .coaches-grid {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
            align-items: stretch;
          }

          .loading-state,
          .empty-state {
            margin-top: 24px;
            padding: 40px 24px;
            border-radius: 24px;
            text-align: center;
            background: rgba(255, 255, 255, 0.04);
            border: 1px dashed rgba(255,255,255,0.12);
            box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
          }

          .loading-state h2,
          .empty-state h2 {
            margin: 0 0 10px;
            font-size: 24px;
            color: #f4fff9;
          }

          .loading-state p,
          .empty-state p {
            margin: 0;
            color: #9fb1b0;
            line-height: 1.7;
          }

          .error-state {
            margin-top: 24px;
            padding: 20px 24px;
            border-radius: 18px;
            background: rgba(255, 118, 117, 0.12);
            border: 1px solid rgba(248, 113, 113, 0.2);
            color: #fee2e2;
            text-align: center;
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
            <p className="filter-label">Coachs Disponibles</p>
            <h1>Nos coachs</h1>
            <p>
              Découvrez les coachs spécialisés disponibles pour vous accompagner
              dans votre parcours fitness.
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
              {uniqueSpecialties.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>
          </div>
        </section>

        {loading ? (
          <div className="loading-state">
            <h2>Chargement...</h2>
            <p>Récupération des coachs disponibles.</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <h2>Erreur</h2>
            <p>{error}</p>
          </div>
        ) : coaches.length === 0 ? (
          <div className="empty-state">
            <h2>Aucun coach disponible</h2>
            <p>Revenez plus tard pour de nouvelles offres.</p>
          </div>
        ) : filteredCoaches.length === 0 ? (
          <div className="empty-state">
            <h2>Aucun coach trouvé</h2>
            <p>Essayez un autre filtre ou revenez plus tard pour de nouvelles offres.</p>
          </div>
        ) : (
          <div className="coaches-grid">
            {filteredCoaches.map((coach) => (
              <CoachCard key={coach.id} coach={coach} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
