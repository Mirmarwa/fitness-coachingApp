import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const API_URL = "http://127.0.0.1:8000";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80";

function Dashboard() {
  const [payments, setPayments] = useState([]);
  const [programs, setPrograms] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const paymentsResponse = await fetch("http://127.0.0.1:8000/api/payments/my/", {
  headers: {
    "Authorization": `Bearer ${localStorage.getItem("token")}`
  }
})
        const paymentsData = await paymentsResponse.json();
        const uniqueProgramIds = [...new Set(paymentsData.map((p) => p.program))];

        setPayments(paymentsData);

        const programEntries = await Promise.all(
          uniqueProgramIds.map(async (programId) => {
            const programResponse = await fetch(`${API_URL}/api/programs/${programId}/`);
            const programData = await programResponse.json();
            return [programId, programData];
          })
        );

        setPrograms(Object.fromEntries(programEntries));
      } catch {
        toast.error("Impossible de charger le tableau de bord");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const purchasedPrograms = useMemo(() => {
    const seenPrograms = new Set();

    return payments.reduce((items, payment) => {
      const program = programs[payment.program];
      const programId = program?.id || payment.program;

      if (seenPrograms.has(programId)) {
        return items;
      }

      seenPrograms.add(programId);
      items.push({ payment, program });
      return items;
    }, []);
  }, [payments, programs]);

  const totalPaid = useMemo(
    () =>
      purchasedPrograms.reduce(
        (sum, item) => sum + Number(item.payment.amount || 0),
        0
      ),
    [purchasedPrograms]
  );

  const formatPrice = (amount) => `${Number(amount || 0).toFixed(2)} DH`;

  const getImageUrl = (image) => {
    if (!image || typeof image !== "string") return PLACEHOLDER_IMAGE;
    if (image.startsWith("http")) return image;
    return `${API_URL}${image}`;
  };

  const getShortDescription = (description) => {
    if (!description) {
      return "Un programme de coaching conçu pour progresser avec régularité.";
    }

    return description.length > 115 ? `${description.slice(0, 115)}...` : description;
  };

  return (
    <main className="dashboard-page">
      <style>
        {`
          .dashboard-page {
            min-height: 100vh;
            padding: 42px 24px;
            background: linear-gradient(135deg, #f8fafc 0%, #ecfdf5 50%, #ffffff 100%);
            color: #10201c;
            font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }

          .dashboard-container {
            width: min(1160px, 100%);
            margin: 0 auto;
          }

          .dashboard-header {
            display: grid;
            grid-template-columns: 1fr auto;
            align-items: end;
            gap: 24px;
            margin-bottom: 28px;
          }

          .dashboard-kicker {
            margin: 0 0 10px;
            color: #0f766e;
            font-size: 13px;
            font-weight: 800;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          .dashboard-title {
            margin: 0;
            font-size: clamp(34px, 6vw, 54px);
            line-height: 1;
          }

          .dashboard-subtitle {
            max-width: 650px;
            margin: 14px 0 0;
            color: #52645f;
            font-size: 16px;
            line-height: 1.7;
          }

          .header-card,
          .stat-card,
          .program-card,
          .empty-state {
            border: 1px solid rgba(15, 118, 110, 0.12);
            background: rgba(255, 255, 255, 0.92);
            box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
          }

          .header-card {
            min-width: 220px;
            padding: 22px;
            border-radius: 20px;
          }

          .header-card strong {
            display: block;
            color: #0f766e;
            font-size: 40px;
            line-height: 1;
          }

          .header-card span {
            display: block;
            margin-top: 8px;
            color: #64748b;
            font-size: 14px;
            font-weight: 700;
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 18px;
            margin-bottom: 34px;
          }

          .stat-card {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 22px;
            border-radius: 20px;
          }

          .stat-icon {
            display: grid;
            place-items: center;
            width: 52px;
            height: 52px;
            flex: 0 0 52px;
            border-radius: 16px;
            background: #dcfce7;
            color: #166534;
            font-size: 24px;
          }

          .stat-card:nth-child(2) .stat-icon {
            background: #ccfbf1;
            color: #0f766e;
          }

          .stat-label {
            margin: 0 0 6px;
            color: #64748b;
            font-size: 13px;
            font-weight: 800;
            text-transform: uppercase;
          }

          .stat-value {
            margin: 0;
            color: #0f172a;
            font-size: 28px;
            font-weight: 900;
          }

          .section-heading {
            margin-bottom: 18px;
          }

          .section-heading h2 {
            margin: 0;
            font-size: 25px;
          }

          .program-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 24px;
          }

          .program-card {
            overflow: hidden;
            border-radius: 22px;
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

          .program-topline {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 14px;
            margin-bottom: 10px;
          }

          .program-title {
            margin: 0;
            color: #0f172a;
            font-size: 22px;
            line-height: 1.25;
          }

          .program-price {
            color: #0f766e;
            font-size: 18px;
            font-weight: 900;
            white-space: nowrap;
          }

          .program-description {
            min-height: 72px;
            margin: 0 0 22px;
            color: #52645f;
            font-size: 15px;
            line-height: 1.6;
          }

          .program-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            min-height: 46px;
            border-radius: 14px;
            background: #0f766e;
            color: #ffffff;
            box-shadow: 0 14px 28px rgba(15, 118, 110, 0.22);
            font-size: 15px;
            font-weight: 900;
            text-decoration: none;
            transition: transform 160ms ease, background 160ms ease, box-shadow 160ms ease;
          }

          .program-button:hover {
            transform: translateY(-2px);
            background: #115e59;
            box-shadow: 0 18px 34px rgba(15, 118, 110, 0.28);
          }

          .empty-state {
            display: grid;
            place-items: center;
            min-height: 280px;
            padding: 38px 24px;
            border-style: dashed;
            border-radius: 22px;
            text-align: center;
          }

          .empty-state h2 {
            margin: 0 0 10px;
            color: #0f172a;
            font-size: 25px;
          }

          .empty-state p {
            max-width: 430px;
            margin: 0;
            color: #64748b;
            line-height: 1.6;
          }

          @media (max-width: 760px) {
            .dashboard-page {
              padding: 28px 16px;
            }

            .dashboard-header {
              grid-template-columns: 1fr;
            }

            .header-card {
              min-width: 0;
            }

            .stats-grid {
              grid-template-columns: 1fr;
            }
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

        <section className="stats-grid" aria-label="Statistiques du tableau de bord">
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

        <section>
          <div className="section-heading">
            <h2>Programmes achetés</h2>
          </div>

          {loading ? (
            <div className="empty-state">
              <div>
                <h2>Chargement des programmes...</h2>
                <p>Vos programmes achetés sont en cours de préparation.</p>
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
              {purchasedPrograms.map(({ payment, program }) => (
                <article className="program-card" key={program?.id || payment.program}>
                  <div className="program-image-box">
                    <img
                      className="program-image"
                      src={getImageUrl(program?.image)}
                      alt={program?.title || "Programme fitness"}
                      onError={(event) => {
                        event.currentTarget.src = PLACEHOLDER_IMAGE;
                      }}
                    />
                    <span className="paid-badge">✔️ Payé</span>
                  </div>

                  <div className="program-content">
                    <div className="program-topline">
                      <h3 className="program-title">
                        {program?.title || "Programme fitness"}
                      </h3>
                      <span className="program-price">{formatPrice(payment.amount)}</span>
                    </div>

                    <p className="program-description">
                      {getShortDescription(program?.description)}
                    </p>

                    {program?.id && (
                      <Link className="program-button" to={`/program/${program.id}`}>
                        Voir le programme
                      </Link>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default Dashboard;
