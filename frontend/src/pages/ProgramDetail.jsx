import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { authFetch, API_BASE_URL } from "../services/api";

const API_URL = "http://127.0.0.1:8000";

const MOCK_PROGRAMS = [
  {
    id: 1,
    title: "Programme Prise de Masse",
    description:
      "Un plan complet pour developper la force, augmenter le volume musculaire et progresser semaine apres semaine.",
    price: 199,
    image:
      "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1200&q=80",
    exercises: [
      { id: 1, name: "Developpe couche", sets: 4, reps: 10 },
      { id: 2, name: "Squat", sets: 4, reps: 8 },
      { id: 3, name: "Rowing barre", sets: 3, reps: 12 },
    ],
    nutrition_plans: [
      { id: 1, title: "Petit-dejeuner proteine", calories: 650 },
      { id: 2, title: "Dejeuner prise de masse", calories: 850 },
    ],
  },
  {
    id: 2,
    title: "Programme Perte de Poids",
    description:
      "Des seances dynamiques et un suivi nutritionnel simple pour bruler les graisses durablement.",
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
      "Une base claire pour apprendre les mouvements essentiels et construire une routine solide.",
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

function ProgramDetail() {
  const { id } = useParams();
  const [program, setProgram] = useState(null);
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const loadProgram = async () => {
      try {
        const [programResponse, paymentResponse, userPaymentsResponse] = await Promise.all([
          authFetch(`${API_BASE_URL}/programs/${id}/full/`),
          authFetch(`${API_BASE_URL}/payments/check/${id}/`),
          authFetch(`${API_BASE_URL}/payments/my/`),
        ]);

        if (!programResponse.ok) {
          throw new Error("Program not found");
        }

        const programData = await programResponse.json();
        await paymentResponse.json().catch(() => ({}));
        const userPaymentsData = userPaymentsResponse.ok
          ? await userPaymentsResponse.json()
          : [];

        if (!programData || Object.keys(programData).length === 0) {
          throw new Error("Empty program");
        }

        const userPaid = Array.isArray(userPaymentsData)
          ? userPaymentsData.some((payment) => {
              const programId =
                typeof payment.program === "object"
                  ? payment.program?.id
                  : payment.program;

              return (
                String(programId) === String(id) &&
                (!payment.status || payment.status === "completed")
              );
            })
          : false;

        setProgram(programData);
        setPaid(userPaid);
      } catch {
        const mockProgram =
          MOCK_PROGRAMS.find((item) => String(item.id) === String(id)) ||
          MOCK_PROGRAMS[0];

        setProgram(mockProgram);
        setPaid(false);
        toast.error("Impossible de charger le programme complet");
      } finally {
        setLoading(false);
      }
    };

    loadProgram();
  }, [id]);

  const price = useMemo(() => Number(program?.price || program?.amount || 100), [program]);

  const exercises = Array.isArray(program?.exercises) ? program.exercises : [];
  const nutritionPlans = Array.isArray(program?.nutrition_plans)
    ? program.nutrition_plans
    : [];

  const getImageUrl = (image) => {
    if (!image || typeof image !== "string") return FALLBACK_IMAGE;
    if (image.startsWith("http")) return image;
    return `${API_URL}${image}`;
  };

  const handlePayment = async () => {
    if (paid || paying) return;

    setPaying(true);

    try {
      let response = await authFetch(`${API_BASE_URL}/payments/create/`, {
        method: "POST",
        body: JSON.stringify({
          program_id: id,
        }),
      });
      let paymentData = await response.json().catch(() => ({}));

      if (!response.ok || paymentData.error) {
        response = await authFetch(`${API_BASE_URL}/payments/create/`, {
          method: "POST",
          body: JSON.stringify({
            program: id,
            program_id: id,
            amount: price,
          }),
        });
        paymentData = await response.json().catch(() => ({}));
      }

      if (!response.ok || paymentData.error) {
        throw new Error("Payment failed");
      }

      setPaid(true);
      toast.success("Paiement validé, programme débloqué");
    } catch {
      toast.error("Impossible de finaliser le paiement");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <main className="detail-page">
        <style>{detailStyles}</style>
        <div className="empty-box">Chargement du programme...</div>
      </main>
    );
  }

  return (
    <main className="detail-page">
      <style>{detailStyles}</style>

      <section
        className="detail-hero"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(6, 78, 59, 0.9), rgba(15, 118, 110, 0.45)), url(${getImageUrl(
            program.image
          )})`,
        }}
      >
        <div className="hero-content">
          <Link to="/programmes" className="back-link">
            Retour aux programmes
          </Link>

          <span className="status-badge">
            {paid ? "✔️ Payé" : "Programme premium"}
          </span>

          <h1>{program.title}</h1>
          <p>{program.description}</p>

          <div className="hero-actions">
            <strong>{price.toFixed(2)} DH</strong>
            <button
              type="button"
              onClick={handlePayment}
              disabled={paid || paying}
              className={paid ? "buy-button paid" : "buy-button"}
            >
              {paid
                ? "Déjà acheté ✅"
                : paying
                  ? "Paiement en cours..."
                  : "Acheter ce programme"}
            </button>
          </div>
        </div>
      </section>

      <section className="detail-grid">
        <div className="detail-panel">
          <div className="panel-header">
            <span>🏋️</span>
            <div>
              <p>Entrainement</p>
              <h2>Exercices</h2>
            </div>
          </div>

          <div className="mini-card-grid">
            {exercises.length === 0 ? (
              <div className="empty-mini-card">Aucun exercice disponible</div>
            ) : (
              exercises.map((exercise) => (
                <article className="mini-card" key={exercise.id || exercise.name}>
                  <h3>{exercise.name}</h3>
                  <div className="mini-meta">
                    <span>{exercise.sets || 0} séries</span>
                    <span>{exercise.reps || 0} reps</span>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>

        <div className="detail-panel">
          <div className="panel-header">
            <span>🥗</span>
            <div>
              <p>Nutrition</p>
              <h2>Plans nutritionnels</h2>
            </div>
          </div>

          <div className="mini-card-grid">
            {nutritionPlans.length === 0 ? (
              <div className="empty-mini-card">
                Aucun plan nutritionnel disponible
              </div>
            ) : (
              nutritionPlans.map((plan) => (
                <article className="mini-card" key={plan.id || plan.title}>
                  <h3>{plan.title}</h3>
                  <div className="mini-meta">
                    <span>{plan.calories || 0} kcal</span>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

const detailStyles = `
  .detail-page {
    min-height: 100vh;
    padding: 34px 24px 56px;
    background: linear-gradient(135deg, #f8fafc 0%, #ecfdf5 55%, #ffffff 100%);
    color: #10201c;
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .detail-hero {
    width: min(1160px, 100%);
    min-height: 430px;
    margin: 0 auto 28px;
    display: flex;
    align-items: flex-end;
    border-radius: 26px;
    overflow: hidden;
    background-size: cover;
    background-position: center;
    box-shadow: 0 24px 70px rgba(15, 23, 42, 0.18);
  }

  .hero-content {
    width: 100%;
    padding: 42px;
    color: white;
  }

  .back-link {
    display: inline-flex;
    margin-bottom: 18px;
    color: white;
    text-decoration: none;
    font-weight: 800;
  }

  .status-badge {
    display: inline-flex;
    padding: 8px 12px;
    border-radius: 999px;
    background: rgba(220, 252, 231, 0.94);
    color: #166534;
    font-size: 13px;
    font-weight: 900;
  }

  .hero-content h1 {
    max-width: 780px;
    margin: 16px 0 14px;
    font-size: clamp(34px, 6vw, 58px);
    line-height: 1;
  }

  .hero-content p {
    max-width: 760px;
    margin: 0 0 24px;
    color: #ecfdf5;
    font-size: 17px;
    line-height: 1.7;
  }

  .hero-actions {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  .hero-actions strong {
    font-size: 30px;
  }

  .buy-button {
    border: 0;
    border-radius: 15px;
    padding: 14px 22px;
    background: #22c55e;
    color: white;
    font-size: 15px;
    font-weight: 900;
    cursor: pointer;
    box-shadow: 0 16px 32px rgba(34, 197, 94, 0.28);
    transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease;
  }

  .buy-button:hover {
    transform: translateY(-2px);
    background: #16a34a;
    box-shadow: 0 20px 38px rgba(34, 197, 94, 0.34);
  }

  .buy-button.paid {
    background: #d1fae5;
    color: #166534;
    cursor: not-allowed;
    box-shadow: none;
  }

  .buy-button.paid:hover {
    transform: none;
  }

  .detail-grid {
    width: min(1160px, 100%);
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 22px;
  }

  .detail-panel {
    padding: 24px;
    border-radius: 22px;
    background: white;
    border: 1px solid rgba(15, 118, 110, 0.12);
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
  }

  .panel-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 18px;
  }

  .panel-header > span {
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    border-radius: 15px;
    background: #dcfce7;
    font-size: 24px;
  }

  .panel-header p {
    margin: 0 0 4px;
    color: #0f766e;
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
  }

  .panel-header h2 {
    margin: 0;
    font-size: 24px;
  }

  .mini-card-grid {
    display: grid;
    gap: 14px;
  }

  .mini-card,
  .empty-mini-card {
    padding: 18px;
    border-radius: 18px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
  }

  .mini-card {
    transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
  }

  .mini-card:hover {
    transform: translateY(-3px);
    border-color: rgba(20, 184, 166, 0.34);
    box-shadow: 0 14px 28px rgba(15, 23, 42, 0.08);
  }

  .mini-card h3 {
    margin: 0 0 12px;
    color: #0f172a;
    font-size: 18px;
  }

  .mini-meta {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .mini-meta span {
    padding: 7px 10px;
    border-radius: 999px;
    background: #dcfce7;
    color: #166534;
    font-size: 13px;
    font-weight: 800;
  }

  .empty-mini-card,
  .empty-box {
    color: #64748b;
    text-align: center;
  }

  .empty-box {
    width: min(760px, 100%);
    margin: 0 auto;
    padding: 40px;
    border-radius: 22px;
    background: white;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
  }

  @media (max-width: 760px) {
    .detail-page {
      padding: 24px 16px 42px;
    }

    .detail-hero {
      min-height: 430px;
    }

    .hero-content {
      padding: 28px;
    }
  }
`;

export default ProgramDetail;
