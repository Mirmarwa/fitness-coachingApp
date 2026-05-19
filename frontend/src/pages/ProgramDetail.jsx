import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { authFetch, API_BASE_URL, BACKEND_BASE_URL } from "../services/api";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80";

const getUserIdFromToken = (token) => {
  try {
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.user_id;
  } catch {
    return null;
  }
};

function ProgramDetail() {
  const { id } = useParams();
  const [program, setProgram] = useState(null);
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState(null);

  const getEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11)
      ? `https://www.youtube.com/embed/${match[2]}`
      : null;
  };

  const hasVideo = Boolean(program?.video_url || program?.video_file);

  useEffect(() => {
    const loadProgram = async () => {
      try {
        const [programResponse, paymentResponse, userPaymentsResponse, myCoachesResponse] = await Promise.all([
          authFetch(`${API_BASE_URL}/programs/${id}/full/`),
          authFetch(`${API_BASE_URL}/payments/check/${id}/`),
          authFetch(`${API_BASE_URL}/payments/my/`),
          authFetch(`${API_BASE_URL}/subscriptions/my-coaches/`),
        ]);

        if (!programResponse.ok) {
          throw new Error("Program not found");
        }

        const programData = await programResponse.json();
        await paymentResponse.json().catch(() => ({}));
        const userPaymentsData = userPaymentsResponse.ok
          ? await userPaymentsResponse.json()
          : [];
        const myCoachesData = myCoachesResponse && myCoachesResponse.ok
          ? await myCoachesResponse.json()
          : [];

        if (!programData || Object.keys(programData).length === 0) {
          throw new Error("Empty program");
        }

        const programPayload = programData.program || programData;

        // 1. Achat individuel
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

        // 2. Abonnement actif avec le coach du programme
        const activeSub = Array.isArray(myCoachesData)
          ? myCoachesData.some((sub) => String(sub.coach) === String(programPayload.coach) && sub.status === "active")
          : false;

        // 3. Propriétaire (coach du programme) ou admin/staff
        const token = localStorage.getItem("access");
        const currentUserId = getUserIdFromToken(token);
        const currentRole = localStorage.getItem("user_role") || "client";

        const isOwner = currentUserId && String(programPayload.coach) === String(currentUserId);
        const isAdmin = currentRole === "admin" || currentRole === "staff";

        const hasAccess = isOwner || isAdmin || userPaid || activeSub;

        setProgram(programPayload);
        setPaid(hasAccess);
      } catch {
        setProgram(null);
        setPaid(false);
        setError("Impossible de charger le programme complet.");
        toast.error("Impossible de charger le programme complet");
      } finally {
        setLoading(false);
      }
    };

    loadProgram();
  }, [id]);

  const price = useMemo(() => Number(program?.price ?? program?.amount), [program]);
  const hasValidPrice = Number.isFinite(price) && price > 0;
  const priceLabel = hasValidPrice ? `${price.toFixed(2)} DH` : "Prix non disponible";

  const exercises = Array.isArray(program?.exercises) ? program.exercises : [];
  const nutritionPlans = Array.isArray(program?.nutrition_plans)
    ? program.nutrition_plans
    : [];

  const getImageUrl = (image) => {
    if (!image || typeof image !== "string") return FALLBACK_IMAGE;
    if (image.startsWith("http")) return image;
    return `${BACKEND_BASE_URL}${image}`;
  };

  const handlePayment = async () => {
    if (paid || paying || !program || !hasValidPrice) {
      if (!hasValidPrice) toast.error("Prix non disponible pour ce programme");
      return;
    }

    setPaying(true);

    try {
      const response = await authFetch(`${API_BASE_URL}/payments/create/`, {
        method: "POST",
        body: JSON.stringify({
          program: id,
          amount: price,
        }),
      });

      const paymentData = await response.json().catch(() => ({}));

      if (!response.ok || paymentData.error) {
        const errorMsg = paymentData.error || "Impossible de finaliser le paiement";
        throw new Error(errorMsg);
      }

      setPaid(true);
      toast.success("Paiement validé, programme débloqué");
    } catch (err) {
      const errorMsg = err?.message || "Impossible de finaliser le paiement";
      toast.error(errorMsg);
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

  if (!program) {
    return (
      <main className="detail-page">
        <style>{detailStyles}</style>
        <div className="empty-box">{error || "Programme introuvable."}</div>
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

          <h1>{program.title || "Programme fitness"}</h1>
          <p>{program.description || "Description non disponible"}</p>

          <div className="hero-actions">
            <strong>{priceLabel}</strong>
            <button
              type="button"
              onClick={handlePayment}
              disabled={paid || paying || !hasValidPrice}
              className={paid ? "buy-button paid" : "buy-button"}
            >
              {paid
                ? "Déjà acheté ✅"
                : paying
                  ? "Paiement en cours..."
                  : hasValidPrice
                    ? "Acheter ce programme"
                    : "Paiement indisponible"}
            </button>
          </div>
        </div>
      </section>

      {paid && hasVideo && (
        <section className="video-section">
          <div className="video-container">
            <h2 className="video-title">🎥 Vidéo du Programme</h2>
            <div className="player-wrapper">
              {program.video_url && getEmbedUrl(program.video_url) ? (
                <iframe
                  src={getEmbedUrl(program.video_url)}
                  title={program.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : program.video_url ? (
                <video
                  src={program.video_url}
                  controls
                  className="native-player"
                ></video>
              ) : program.video_file ? (
                <video
                  src={getImageUrl(program.video_file)}
                  controls
                  className="native-player"
                ></video>
              ) : null}
            </div>
          </div>
        </section>
      )}

      {!paid && hasVideo && (
        <section className="video-section locked">
          <div className="video-container">
            <div className="locked-overlay">
              <span className="lock-icon">🔒</span>
              <h2>Vidéo exclusive réservée aux membres</h2>
              <p>Achetez ce programme pour débloquer immédiatement la vidéo d'accompagnement et commencer votre entraînement.</p>
            </div>
          </div>
        </section>
      )}

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
              <div className="empty-mini-card">Aucun exercice</div>
            ) : (
              exercises.map((exercise) => (
                <article className="mini-card" key={exercise.id || exercise.name}>
                  <h3>{exercise.name || "Exercice"}</h3>
                  <p className="mini-card-desc">
                    {exercise.description || "Description de l'exercice non disponible."}
                  </p>
                  <div className="mini-meta">
                    <span>{exercise.sets || "–"} séries</span>
                    <span>{exercise.reps || "–"} reps</span>
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
                Aucun plan nutritionnel
              </div>
            ) : (
              nutritionPlans.map((plan) => (
                <article className="mini-card" key={plan.id || plan.title}>
                  <h3>{plan.title || "Plan nutritionnel"}</h3>
                  <p className="mini-card-desc">
                    {plan.calories ? `${plan.calories} kcal` : "Calories non définies"}
                    {plan.protein || plan.carbs || plan.fats ? ", " : ""}
                    {plan.protein ? `${plan.protein}g protéines` : ""}
                    {plan.protein && plan.carbs ? ", " : ""}
                    {plan.carbs ? `${plan.carbs}g glucides` : ""}
                    {(plan.protein || plan.carbs) && plan.fats ? ", " : ""}
                    {plan.fats ? `${plan.fats}g lipides` : ""}
                  </p>
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

  .mini-card-desc {
    margin: 0 0 10px;
    color: #475569;
    font-size: 14px;
    line-height: 1.5;
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

  .video-section {
    width: min(1160px, 100%);
    margin: 0 auto 28px;
  }

  .video-container {
    background: white;
    border: 1px solid rgba(15, 118, 110, 0.12);
    border-radius: 22px;
    padding: 24px;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
  }

  .video-title {
    margin: 0 0 16px;
    font-size: 20px;
    font-weight: 800;
    color: #0f172a;
  }

  .player-wrapper {
    position: relative;
    padding-top: 56.25%; /* 16:9 Aspect Ratio */
    border-radius: 14px;
    overflow: hidden;
    background: #0f172a;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  }

  .player-wrapper iframe,
  .player-wrapper video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }

  .native-player {
    object-fit: contain;
  }

  .video-section.locked .video-container {
    background: linear-gradient(135deg, rgba(15, 118, 110, 0.05) 0%, rgba(15, 23, 42, 0.05) 100%);
    border: 1px dashed rgba(15, 118, 110, 0.3);
    padding: 40px 24px;
    text-align: center;
  }

  .locked-overlay {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .lock-icon {
    font-size: 40px;
    animation: pulse 2s infinite ease-in-out;
  }

  .locked-overlay h2 {
    margin: 0;
    font-size: 20px;
    color: #0f766e;
    font-weight: 800;
  }

  .locked-overlay p {
    margin: 0;
    max-width: 500px;
    font-size: 14px;
    color: #64748b;
    line-height: 1.5;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
`;

export default ProgramDetail;
