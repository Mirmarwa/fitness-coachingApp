import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  API_BASE_URL,
  BACKEND_BASE_URL,
  getMyProgress,
} from "../services/api";
import ProgramCard from "../components/ProgramCard";
import ProgressStats from "../components/ProgressStats";
import ProgressCharts from "../components/ProgressCharts";
import BadgeSystem from "../components/BadgeSystem";
import { useAuth } from "../context/AuthContext";
import { getPostLoginPath } from "../utils/authSession";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80";

const COACH_SESSION_AMOUNT = 250;

function Dashboard() {
  const [payments, setPayments] = useState([]);
  const [purchasedPrograms, setPurchasedPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progressData, setProgressData] = useState([]);
  const navigate = useNavigate();
  const { user, loading: authLoading, isCoach, isStaff } = useAuth();

  useEffect(() => {
    let isMounted = true;

    if (authLoading) {
      return () => {
        isMounted = false;
      };
    }

    if (user && (isCoach || isStaff)) {
      navigate(getPostLoginPath(user), { replace: true });
      return () => {
        isMounted = false;
      };
    }

    // Fetch with timeout to prevent infinite loading
    const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === "AbortError") throw new Error("timeout");
        throw error;
      }
    };

    const loadDashboard = async () => {
      try {
        const token = localStorage.getItem("access");

        const paymentsResponse = await fetchWithTimeout(
          `${API_BASE_URL}/payments/my/`,
          { headers: { Authorization: `Bearer ${token}` } },
          8000,
        );

        if (!isMounted) return;

        if (paymentsResponse.ok) {
          let paymentsData;
          try {
            paymentsData = await paymentsResponse.json();
            setPayments(Array.isArray(paymentsData) ? paymentsData : []);
          } catch {
            setPayments([]);
          }
        }

        if (!isMounted) return;

        const programsResponse = await fetchWithTimeout(
          `${API_BASE_URL}/programs/unlocked/`,
          { headers: { Authorization: `Bearer ${token}` } },
          8000,
        );

        if (programsResponse.ok) {
          try {
            const unlockedPrograms = await programsResponse.json();
            setPurchasedPrograms(Array.isArray(unlockedPrograms) ? unlockedPrograms : []);
          } catch {
            setPurchasedPrograms([]);
          }
        }

        if (!isMounted) return;

        // Load progress data
        try {
          const progressDataResult = await getMyProgress();
          if (isMounted) {
            setProgressData(
              Array.isArray(progressDataResult) ? progressDataResult : [],
            );
          }
        } catch (error) {
          console.error("Error loading progress:", error);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Dashboard error:", error);
          setError("Impossible de charger le tableau de bord.");
          if (error.message !== "timeout") {
            toast.error("Impossible de charger le tableau de bord");
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    // Fallback: ensure loading is always set to false after 15 seconds max
    const fallbackTimeout = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
      }
    }, 15000);

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimeout);
    };
  }, [authLoading, user, isCoach, isStaff, navigate]);

  const totalPaid = payments.reduce(
    (total, payment) => total + Number(payment.amount || 0),
    0,
  );

  const getImageUrl = (image) => {
    if (!image || typeof image !== "string") return PLACEHOLDER_IMAGE;
    if (image.startsWith("http")) return image;
    return `${BACKEND_BASE_URL}${image}`;
  };

  const formatPrice = (amount) => `${Number(amount || 0).toFixed(2)} DH`;

  const formatDate = (value) => {
    if (!value) return "Non définie";

    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(value));
  };

  const getShortDescription = (description) => {
    if (!description) {
      return "Un programme fitness clair, motivant et facile à suivre.";
    }

    return description.length > 115
      ? `${description.slice(0, 115)}...`
      : description;
  };

  return (
    <main className="dashboard-page">

      <style>{`
        .dashboard-page {
          min-height: 100vh;
          padding: 42px 24px;
          background: radial-gradient(circle at top left, rgba(16, 185, 129, 0.14), transparent 24%),
            linear-gradient(180deg, #050a11 0%, #0f172a 45%, #111924 100%);
          color: #e6eef0;
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .dashboard-container {
          width: min(1100px, 100%);
          margin: 0 auto;
          padding: 0 12px;
        }

        .dashboard-header {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: end;
          gap: 24px;
          margin-bottom: 20px;
        }

        .dashboard-kicker {
          margin: 0 0 10px;
          color: #9ff2c9;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .dashboard-title { margin: 0; font-size: clamp(34px, 6vw, 54px); line-height: 1; color: #f7fffb; }

        .dashboard-subtitle { max-width: 650px; margin: 14px 0 0; color: #9fb1b0; font-size: 16px; line-height: 1.6; }

        .header-card, .stat-card, .program-card, .empty-state {
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          box-shadow: 0 24px 70px rgba(0, 0, 0, 0.45);
        }

        .header-card { min-width: 220px; padding: 22px; border-radius: 18px; }

        .header-card strong { display:block; color: #bff7e6; font-size: 36px; line-height:1; }

        .header-card span { display:block; margin-top:8px; color:#9fb1b0; font-size:14px; font-weight:700 }

        .stats-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap:28px; margin:40px auto; justify-items:center; width:100%; }

        .stat-card { display:flex; align-items:center; gap:20px; padding: 28px; border-radius: 20px; width:100%; max-width:480px; min-height:140px }

        .stat-icon { display:grid; place-items:center; width:72px; height:72px; border-radius:14px; background: linear-gradient(135deg, rgba(16,185,129,0.12), rgba(6,95,70,0.06)); color:#dff8ef; font-size:30px }

        .stat-label { margin:0 0 8px; color:#9fb1b0; font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:0.04em }

        .stat-value { margin:0; color:#f1fff8; font-size:36px; font-weight:900 }

        .section-heading { margin-bottom:18px; display:flex; justify-content:space-between; align-items:center }

        .section-heading h2 { margin:0; font-size:22px }

        .view-more-link { font-size:14px; font-weight:700; color:#9ff2c9; text-decoration:none }

        .dashboard-container > section { margin-bottom:48px }

        .program-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:24px }

        .program-card { overflow:hidden; border-radius:22px; transition: transform 200ms cubic-bezier(.16,1,.3,1), box-shadow 200ms ease }

        .program-card:hover { transform: translateY(-8px); box-shadow: 0 40px 120px rgba(0, 0, 0, 0.7), 0 0 36px rgba(16,185,129,0.12) }

        .program-image-box { position:relative; aspect-ratio:16/10; overflow:hidden; background: linear-gradient(180deg, rgba(16,185,129,0.06), rgba(6,95,70,0.03)) }

        .program-image { width:100%; height:100%; object-fit:cover; transition: transform 260ms ease }

        .program-card:hover .program-image { transform: scale(1.06) }

        .paid-badge { position:absolute; top:14px; right:14px; padding:8px 12px; border-radius:999px; background: rgba(16,185,129,0.12); color:#e6fff6; font-size:13px; font-weight:900 }

        .program-content { padding:24px }

        .program-topline { display:flex; align-items:flex-start; justify-content:space-between; gap:14px; margin-bottom:10px }

          .program-title { margin:0; color:#f1fff8; font-size:20px; line-height:1.25 }

          .program-price { color:#bff7e6; font-size:16px; font-weight:900 }

          .program-description { min-height:64px; margin:0 0 18px; color:#9fb1b0; font-size:14px; line-height:1.6 }

          .program-button { display:inline-flex; align-items:center; justify-content:center; width:100%; min-height:44px; border-radius:12px; background:linear-gradient(135deg,#10b981,#059669); color:#02140f; box-shadow:0 14px 36px rgba(16,185,129,0.14); font-size:15px; font-weight:900; text-decoration:none }
            

          .program-button:hover {
            transform: translateY(-2px);
            background: #115e59;
            box-shadow: 0 18px 34px rgba(15, 118, 110, 0.28);
          }

          .empty-state { display:grid; place-items:center; min-height:220px; padding:28px; border-radius:18px; background: rgba(255,255,255,0.04); border: 1px dashed rgba(255,255,255,0.12); }

          .loading-spinner { width:42px; height:42px; margin:0 auto 16px; border:4px solid rgba(16,185,129,0.12); border-top-color: rgba(16,185,129,0.35); border-radius:999px; animation: dashboard-spin 850ms linear infinite }

          @keyframes dashboard-spin {
            to {
              transform: rotate(360deg);
            }
          }

          .empty-state h2 { margin:0 0 8px; color:#f1fff8; font-size:20px }

          .empty-state p { max-width:420px; margin:0; color:#9fb1b0; line-height:1.6 }

          @media (max-width: 900px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    max-width: 100%;
  }
}

@media (max-width: 760px) {
  .dashboard-page { padding:28px 16px }

  .dashboard-header { grid-template-columns: 1fr }

  .header-card { min-width:0 }

  .stat-card { padding:20px; min-height:120px }

  .stat-value { font-size:28px }
}
        `}
      </style>

      <div className="dashboard-container">
        <header className="dashboard-header">
          <div>
            <p className="dashboard-kicker">Coaching fitness</p>
            <h1 className="dashboard-title">Mon Tableau de Bord</h1>
            <p className="dashboard-subtitle">
              Retrouvez vos programmes achetés, consultez vos accès et reprenez
              votre entraînement en quelques secondes.
            </p>
          </div>

          <div className="header-card">
            <strong>{purchasedPrograms.length}</strong>
            <span>Programmes achetés</span>
          </div>
        </header>

        <section
          className="stats-grid"
          aria-label="Statistiques du tableau de bord"
        >
          <div className="stat-card">
            <div className="stat-icon">🏋️</div>
            <div>
              <p className="stat-label">Programmes</p>
              <p className="stat-value">{purchasedPrograms.length}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💳</div>
            <div>
              <p className="stat-label">Total payé</p>
              <p className="stat-value">{formatPrice(totalPaid)}</p>
            </div>
          </div>
        </section>

        {progressData.length > 0 && (
          <section>
            <div className="section-heading">
              <h2>📊 Mon évolution</h2>
              <Link to="/progress" className="view-more-link">
                Voir détails →
              </Link>
            </div>
            <ProgressStats data={progressData} />
            <ProgressCharts data={progressData} />
            <BadgeSystem data={progressData} />
          </section>
        )}

        <section>
          <div className="section-heading">
            <h2>Programmes achetés</h2>
          </div>

          {loading ? (
            <div className="empty-state">
              <div>
                <div className="loading-spinner" aria-hidden="true" />
                <h2>Chargement des programmes...</h2>
                <p>Vos programmes achetés sont en cours de préparation.</p>
              </div>
            </div>
          ) : error ? (
            <div className="empty-state">
              <div>
                <h2>Erreur de chargement</h2>
                <p>{error}</p>
              </div>
            </div>
          ) : purchasedPrograms.length === 0 ? (
            <div className="empty-state">
              <div>
                <h2>Vous n'avez encore acheté aucun programme</h2>
                <p>
                  Dès que vous achetez un programme, il apparaîtra ici avec son
                  statut et son bouton d'accès.
                </p>
              </div>
            </div>
          ) : (
            <div className="program-grid">
              {purchasedPrograms.map((program, index) => {
                  const resolvedProgramId = program?.id;

                  return (
                    <article
                      className="program-card"
                      key={resolvedProgramId || `program-${index}`}
                    >
                      <div className="program-image-box">
                        <img
                          className="program-image"
                          src={getImageUrl(program?.image)}
                          alt={program?.title || "Programme fitness"}
                          onError={(event) => {
                            event.currentTarget.src = PLACEHOLDER_IMAGE;
                          }}
                        />
                        <span className="paid-badge">✔️ Accessible</span>
                      </div>

                      <div className="program-content">
                        <div className="program-topline">
                          <h3 className="program-title">
                            {program?.title || "Programme fitness"}
                          </h3>
                        </div>

                        <p className="program-description">
                          {getShortDescription(program?.description)}
                        </p>

                        {resolvedProgramId && (
                          <Link
                            className="program-button"
                            to={`/program/${resolvedProgramId}`}
                          >
                            Voir le programme
                          </Link>
                        )}
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default Dashboard;
