import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { authFetchJson, API_BASE_URL } from "../services/api";

export default function CoachDashboard() {
  const [clients, setClients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [clientProgress, setClientProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateProgram, setShowCreateProgram] = useState(false);
  const [newProgram, setNewProgram] = useState({
    title: "",
    description: "",
    duration: 30,
  });

  useEffect(() => {
    loadCoachData();
  }, []);

  const loadCoachData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1️⃣ Charger les rendez-vous du coach
      const appointmentsRes = await authFetchJson(
        `${API_BASE_URL}/appointments/my/`
      );
      setAppointments(Array.isArray(appointmentsRes) ? appointmentsRes : []);

      // 2️⃣ Récupérer les clients uniques (via rendez-vous)
      const clientIds = new Set();
      (Array.isArray(appointmentsRes) ? appointmentsRes : []).forEach((apt) => {
        if (apt.client_name) clientIds.add(apt.client);
      });

      // Aussi chercher les clients via la progression
      try {
        const progressRes = await authFetchJson(`${API_BASE_URL}/progress/`);
        const allProgress = Array.isArray(progressRes) ? progressRes : [];

        // Construire la liste des clients uniques avec leur progression
        const clientsMap = new Map();

        allProgress.forEach((prog) => {
          const clientKey = prog.user;
          if (!clientsMap.has(clientKey)) {
            clientsMap.set(clientKey, {
              id: prog.user,
              name: prog.user_name,
              email: prog.user_name,
              progressRecords: [],
            });
          }
          clientsMap.get(clientKey).progressRecords.push(prog);
        });

        const clientsList = Array.from(clientsMap.values());
        setClients(clientsList);

        // Sauvegarder la progression par client
        const progressMap = {};
        clientsList.forEach((client) => {
          progressMap[client.id] = client.progressRecords.sort(
            (a, b) => new Date(b.date) - new Date(a.date)
          );
        });
        setClientProgress(progressMap);
      } catch {
        console.error("Erreur chargement progression");
        setClients([]);
      }

      // 3️⃣ Charger les programmes du coach
      const programsRes = await authFetchJson(`${API_BASE_URL}/programs/`);
      const allPrograms = Array.isArray(programsRes) ? programsRes : [];

      // Filtrer pour voir uniquement les programmes du coach
      // (Note: Pour cela, faudrait avoir coach_id dans le programme)
      setPrograms(allPrograms);
    } catch (error) {
      setError("Impossible de charger les données du dashboard.");
      toast.error("Erreur lors du chargement du dashboard");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProgram = async () => {
    if (!newProgram.title.trim() || !newProgram.description.trim()) {
      toast.error("Titre et description requis");
      return;
    }

    try {
      const response = await authFetchJson(`${API_BASE_URL}/programs/`, {
        method: "POST",
        body: JSON.stringify(newProgram),
      });

      setPrograms([...programs, response]);
      setNewProgram({ title: "", description: "", duration: 30 });
      setShowCreateProgram(false);
      toast.success("Programme créé !");
      await loadCoachData();
    } catch (error) {
      toast.error("Erreur création programme");
      console.error(error);
    }
  };

  const stats = {
    clients: clients.length,
    appointments: appointments.filter((a) => a.status === "booked").length,
    programs: programs.length,
  };

  return (
    <main className="coach-dashboard">
      <style>
        {`
          .coach-dashboard {
            min-height: 100vh;
            padding: 42px 24px;
            background: linear-gradient(135deg, #f8fafc 0%, #ecfdf5 50%, #ffffff 100%);
            color: #10201c;
            font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }

          .coach-container {
            width: min(1280px, 100%);
            margin: 0 auto;
          }

          .coach-header {
            margin-bottom: 42px;
          }

          .coach-title {
            margin: 0 0 8px;
            font-size: clamp(36px, 6vw, 48px);
            font-weight: 900;
            color: #0f172a;
          }

          .coach-subtitle {
            margin: 0;
            color: #64748b;
            font-size: 18px;
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 42px;
          }

          .stat-card {
            background: white;
            border-radius: 18px;
            border: 1px solid rgba(15, 118, 110, 0.12);
            padding: 28px;
            box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
            text-align: center;
          }

          .stat-number {
            margin: 0;
            font-size: 42px;
            font-weight: 900;
            color: #0f766e;
          }

          .stat-label {
            margin: 8px 0 0;
            color: #64748b;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .section {
            margin-bottom: 42px;
          }

          .section-title {
            margin: 0 0 20px;
            font-size: 22px;
            font-weight: 900;
            color: #0f172a;
            border-bottom: 2px solid #0f766e;
            padding-bottom: 12px;
          }

          .cards-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 20px;
          }

          .card {
            background: white;
            border-radius: 16px;
            border: 1px solid rgba(15, 118, 110, 0.12);
            padding: 20px;
            box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
            transition: all 200ms ease;
          }

          .card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 30px rgba(15, 23, 42, 0.12);
          }

          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 12px;
          }

          .card-title {
            margin: 0;
            font-size: 18px;
            font-weight: 900;
            color: #0f172a;
          }

          .card-badge {
            background: #dcfce7;
            color: #166534;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
          }

          .card-badge.booked {
            background: #fef08a;
            color: #854d0e;
          }

          .card-badge.available {
            background: #dbeafe;
            color: #1e40af;
          }

          .card-content {
            margin: 0;
            color: #52645f;
            font-size: 14px;
            line-height: 1.6;
          }

          .progress-item {
            background: #f8fafc;
            border-radius: 10px;
            padding: 12px;
            margin: 8px 0;
            font-size: 13px;
            color: #52645f;
          }

          .progress-weight {
            font-weight: 700;
            color: #0f766e;
          }

          .empty-state {
            text-align: center;
            padding: 40px 20px;
            color: #64748b;
          }

          .empty-state h3 {
            margin: 0 0 8px;
            font-size: 18px;
          }

          .empty-state p {
            margin: 0;
            font-size: 14px;
          }

          .create-program-section {
            background: white;
            border-radius: 18px;
            border: 1px solid rgba(15, 118, 110, 0.12);
            padding: 28px;
            margin-bottom: 42px;
          }

          .form-group {
            margin-bottom: 16px;
          }

          .form-label {
            display: block;
            margin-bottom: 6px;
            font-weight: 700;
            color: #0f172a;
            font-size: 14px;
          }

          .form-input,
          .form-textarea {
            width: 100%;
            padding: 12px;
            border: 1px solid rgba(15, 118, 110, 0.2);
            border-radius: 8px;
            font-size: 14px;
            font-family: inherit;
            box-sizing: border-box;
          }

          .form-input:focus,
          .form-textarea:focus {
            outline: none;
            border-color: #0f766e;
            box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.1);
          }

          .form-textarea {
            resize: vertical;
            min-height: 100px;
          }

          .button-group {
            display: flex;
            gap: 12px;
          }

          .btn {
            padding: 12px 24px;
            border-radius: 10px;
            border: 0;
            font-weight: 700;
            cursor: pointer;
            transition: all 160ms ease;
            font-size: 14px;
          }

          .btn-primary {
            background: #0f766e;
            color: white;
            box-shadow: 0 8px 16px rgba(15, 118, 110, 0.24);
          }

          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 24px rgba(15, 118, 110, 0.32);
          }

          .btn-secondary {
            background: #ecfdf5;
            color: #0f766e;
            border: 1px solid rgba(15, 118, 110, 0.2);
          }

          .btn-secondary:hover {
            background: #d1fae5;
          }

          @media (max-width: 768px) {
            .coach-dashboard {
              padding: 24px 16px;
            }

            .coach-title {
              font-size: 28px;
            }

            .stats-grid {
              grid-template-columns: 1fr;
            }

            .cards-grid {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>

      <div className="coach-container">
        {loading ? (
          <div className="empty-state">
            <h3>Chargement du dashboard...</h3>
          </div>
        ) : (
          <>
            <div className="coach-header">
              <h1 className="coach-title">Coach Dashboard 🎯</h1>
              <p className="coach-subtitle">
                Gérez vos clients, rendez-vous et programmes
              </p>
            </div>

            {error && (
              <div className="empty-state">
                <h3>Erreur</h3>
                <p>{error}</p>
              </div>
            )}

            {/* 📊 STATISTIQUES */}
            <div className="stats-grid">
              <div className="stat-card">
                <p className="stat-number">{stats.clients}</p>
                <p className="stat-label">Clients actifs</p>
              </div>
              <div className="stat-card">
                <p className="stat-number">{stats.appointments}</p>
                <p className="stat-label">Rendez-vous réservés</p>
              </div>
              <div className="stat-card">
                <p className="stat-number">{stats.programs}</p>
                <p className="stat-label">Programmes créés</p>
              </div>
            </div>

            {/* ➕ CRÉER UN PROGRAMME */}
            <div className="section">
              {!showCreateProgram ? (
                <button
                  className="btn btn-primary"
                  onClick={() => setShowCreateProgram(true)}
                  style={{ marginBottom: "20px" }}
                >
                  + Créer un nouveau programme
                </button>
              ) : (
                <div className="create-program-section">
                  <h2 className="section-title">Nouveau Programme</h2>
                  <div className="form-group">
                    <label className="form-label">Titre du programme</label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="Ex: Prise de masse 12 semaines"
                      value={newProgram.title}
                      onChange={(e) =>
                        setNewProgram({ ...newProgram, title: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-textarea"
                      placeholder="Décrivez le programme..."
                      value={newProgram.description}
                      onChange={(e) =>
                        setNewProgram({
                          ...newProgram,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Durée (jours)</label>
                    <input
                      className="form-input"
                      type="number"
                      value={newProgram.duration}
                      onChange={(e) =>
                        setNewProgram({
                          ...newProgram,
                          duration: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="button-group">
                    <button
                      className="btn btn-primary"
                      onClick={handleCreateProgram}
                    >
                      Créer le programme
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowCreateProgram(false)}
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 👥 MES CLIENTS */}
            <div className="section">
              <h2 className="section-title">👥 Mes clients ({clients.length})</h2>
              {clients.length === 0 ? (
                <div className="empty-state">
                  <h3>Aucun client pour le moment</h3>
                  <p>Les clients apparaîtront quand ils réserveront un créneau</p>
                </div>
              ) : (
                <div className="cards-grid">
                  {clients.map((client) => (
                    <div key={client.id} className="card">
                      <div className="card-header">
                        <h3 className="card-title">{client.name}</h3>
                      </div>
                      <p className="card-content">
                        <strong>Dernière progression:</strong>
                      </p>
                      {clientProgress[client.id]?.length > 0 ? (
                        <>
                          <div className="progress-item">
                            <span className="progress-weight">
                              {
                                clientProgress[client.id][0].weight
                              }{" "}
                              kg
                            </span>
                            <br />
                            <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                              {new Date(
                                clientProgress[client.id][0].date
                              ).toLocaleDateString("fr-FR")}
                            </span>
                          </div>
                          {clientProgress[client.id][0].notes && (
                            <div className="progress-item">
                              <strong>Notes:</strong> "
                              {clientProgress[client.id][0].notes}"
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="card-content" style={{ color: "#94a3b8" }}>
                          Pas encore de progression
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 📅 MES CRÉNEAUX */}
            <div className="section">
              <h2 className="section-title">
                📅 Mes rendez-vous ({appointments.length})
              </h2>
              {appointments.length === 0 ? (
                <div className="empty-state">
                  <h3>Aucun rendez-vous</h3>
                  <p>Créez des créneaux disponibles pour que les clients vous réservent</p>
                </div>
              ) : (
                <div className="cards-grid">
                  {appointments.map((apt) => (
                    <div key={apt.id} className="card">
                      <div className="card-header">
                        <h3 className="card-title">
                          {apt.date} à {apt.time}
                        </h3>
                        <span
                          className={`card-badge ${apt.status === "booked" ? "booked" : "available"}`}
                        >
                          {apt.status === "booked" ? "Réservé" : "Disponible"}
                        </span>
                      </div>
                      <p className="card-content">
                        <strong>Client:</strong>{" "}
                        {apt.client_name || "Non réservé"}
                      </p>
                      {apt.notes && (
                        <p className="card-content">
                          <strong>Notes:</strong> {apt.notes}
                        </p>
                      )}
                      {apt.video_link && (
                        <p className="card-content">
                          <strong>Lien vidéo:</strong>{" "}
                          <a
                            href={apt.video_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#0f766e" }}
                          >
                            Rejoindre
                          </a>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 📚 MES PROGRAMMES */}
            <div className="section">
              <h2 className="section-title">
                📚 Mes programmes ({programs.length})
              </h2>
              {programs.length === 0 ? (
                <div className="empty-state">
                  <h3>Aucun programme créé</h3>
                  <p>Créez votre premier programme pour vos clients</p>
                </div>
              ) : (
                <div className="cards-grid">
                  {programs.map((prog) => (
                    <div key={prog.id} className="card">
                      <h3 className="card-title">{prog.title}</h3>
                      <p className="card-content">{prog.description}</p>
                      <p className="card-content">
                        <strong>Durée:</strong> {prog.duration} jours
                      </p>
                      {prog.exercises && prog.exercises.length > 0 && (
                        <p className="card-content">
                          <strong>Exercices:</strong> {prog.exercises.length}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
