import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { createAppointment, getMyAppointments, confirmAppointment } from "../services/api";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    coachId: "",
    date: "",
    time: "",
    notes: ""
  });

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const data = await getMyAppointments();
      setAppointments(data);
    } catch (error) {
      toast.error("Erreur lors du chargement des rendez-vous");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();

    try {
      await createAppointment(
        parseInt(formData.coachId),
        formData.date,
        formData.time,
        formData.notes
      );
      toast.success("Rendez-vous créé avec succès!");
      setShowCreateForm(false);
      setFormData({ coachId: "", date: "", time: "", notes: "" });
      loadAppointments();
    } catch (error) {
      toast.error("Erreur lors de la création du rendez-vous");
    }
  };

  const handleConfirmAppointment = async (appointmentId) => {
    try {
      await confirmAppointment(appointmentId);
      toast.success("Rendez-vous confirmé!");
      loadAppointments();
    } catch (error) {
      toast.error("Erreur lors de la confirmation");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#10b981';
      case 'completed': return '#6b7280';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmé';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  return (
    <main className="appointments-page">
      <style>
        {`
          .appointments-page {
            min-height: 100vh;
            padding: 42px 24px;
            background: linear-gradient(135deg, #f8fafc 0%, #ecfdf5 50%, #ffffff 100%);
            color: #10201c;
            font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }

          .appointments-container {
            width: min(1000px, 100%);
            margin: 0 auto;
          }

          .appointments-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 32px;
          }

          .appointments-title {
            margin: 0;
            font-size: clamp(34px, 6vw, 54px);
            line-height: 1;
          }

          .create-button {
            padding: 14px 24px;
            border: 0;
            border-radius: 14px;
            background: #0f766e;
            color: white;
            font-size: 16px;
            font-weight: 900;
            cursor: pointer;
            transition: transform 160ms ease, background 160ms ease, box-shadow 160ms ease;
          }

          .create-button:hover {
            transform: translateY(-2px);
            background: #115e59;
            box-shadow: 0 14px 28px rgba(15, 118, 110, 0.22);
          }

          .appointments-grid {
            display: grid;
            gap: 24px;
          }

          .appointment-card {
            padding: 24px;
            border-radius: 22px;
            background: white;
            border: 1px solid rgba(15, 118, 110, 0.12);
            box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
          }

          .appointment-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 16px;
          }

          .appointment-coach {
            margin: 0 0 4px;
            font-size: 20px;
            font-weight: 900;
            color: #0f172a;
          }

          .appointment-status {
            padding: 6px 12px;
            border-radius: 999px;
            font-size: 13px;
            font-weight: 900;
            text-transform: uppercase;
          }

          .appointment-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-bottom: 20px;
          }

          .appointment-detail {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .appointment-label {
            font-size: 13px;
            font-weight: 800;
            text-transform: uppercase;
            color: #64748b;
          }

          .appointment-value {
            font-size: 16px;
            font-weight: 700;
            color: #0f172a;
          }

          .appointment-notes {
            margin: 0 0 20px;
            padding: 16px;
            border-radius: 12px;
            background: #f8fafc;
            color: #374151;
            font-style: italic;
          }

          .appointment-actions {
            display: flex;
            gap: 12px;
          }

          .action-button {
            padding: 10px 20px;
            border: 0;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 900;
            cursor: pointer;
            transition: transform 160ms ease, background 160ms ease;
          }

          .confirm-button {
            background: #10b981;
            color: white;
          }

          .confirm-button:hover {
            transform: translateY(-2px);
            background: #059669;
          }

          .cancel-button {
            background: #ef4444;
            color: white;
          }

          .cancel-button:hover {
            transform: translateY(-2px);
            background: #dc2626;
          }

          .create-form {
            margin-bottom: 32px;
            padding: 24px;
            border-radius: 22px;
            background: white;
            border: 1px solid rgba(15, 118, 110, 0.12);
            box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
          }

          .form-title {
            margin: 0 0 20px;
            font-size: 24px;
            font-weight: 900;
          }

          .form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-bottom: 20px;
          }

          .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .form-label {
            font-size: 16px;
            font-weight: 700;
            color: #0f172a;
          }

          .form-input,
          .form-select,
          .form-textarea {
            padding: 12px 16px;
            border: 1px solid rgba(15, 118, 110, 0.2);
            border-radius: 12px;
            background: #f8fafc;
            color: #0f172a;
            font-size: 16px;
            transition: border-color 160ms ease, box-shadow 160ms ease;
          }

          .form-input:focus,
          .form-select:focus,
          .form-textarea:focus {
            outline: none;
            border-color: #0f766e;
            box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.1);
          }

          .form-textarea {
            resize: vertical;
            min-height: 80px;
          }

          .form-actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
          }

          .submit-button {
            padding: 12px 24px;
            border: 0;
            border-radius: 12px;
            background: #0f766e;
            color: white;
            font-size: 16px;
            font-weight: 900;
            cursor: pointer;
            transition: transform 160ms ease, background 160ms ease;
          }

          .submit-button:hover {
            transform: translateY(-2px);
            background: #115e59;
          }

          .cancel-form-button {
            padding: 12px 24px;
            border: 1px solid #d1d5db;
            border-radius: 12px;
            background: white;
            color: #374151;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
            transition: background 160ms ease;
          }

          .cancel-form-button:hover {
            background: #f9fafb;
          }

          .empty-state {
            display: grid;
            place-items: center;
            min-height: 300px;
            padding: 48px 24px;
            border: 2px dashed rgba(15, 118, 110, 0.2);
            border-radius: 22px;
            text-align: center;
          }

          .empty-state h2 {
            margin: 0 0 10px;
            color: #0f172a;
            font-size: 25px;
          }

          .empty-state p {
            margin: 0;
            color: #64748b;
            line-height: 1.6;
          }

          .loading {
            text-align: center;
            padding: 40px;
            color: #64748b;
          }

          @media (max-width: 768px) {
            .appointments-header {
              flex-direction: column;
              align-items: flex-start;
              gap: 16px;
            }

            .form-grid {
              grid-template-columns: 1fr;
            }

            .appointment-details {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>

      <div className="appointments-container">
        <header className="appointments-header">
          <h1 className="appointments-title">Mes Rendez-vous</h1>
          <button
            className="create-button"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Annuler' : 'Nouveau Rendez-vous'}
          </button>
        </header>

        {showCreateForm && (
          <form className="create-form" onSubmit={handleCreateAppointment}>
            <h2 className="form-title">Créer un nouveau rendez-vous</h2>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="coachId">Coach</label>
                <select
                  id="coachId"
                  className="form-select"
                  value={formData.coachId}
                  onChange={(e) => setFormData(prev => ({ ...prev, coachId: e.target.value }))}
                  required
                >
                  <option value="">Sélectionnez un coach</option>
                  <option value="1">Coach Ahmed</option>
                  <option value="2">Coach Fatima</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="date">Date</label>
                <input
                  id="date"
                  type="date"
                  className="form-input"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="time">Heure</label>
                <input
                  id="time"
                  type="time"
                  className="form-input"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="notes">Notes (optionnel)</label>
              <textarea
                id="notes"
                className="form-textarea"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Ajoutez des détails sur votre rendez-vous..."
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="cancel-form-button"
                onClick={() => setShowCreateForm(false)}
              >
                Annuler
              </button>
              <button type="submit" className="submit-button">
                Créer le rendez-vous
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="loading">Chargement des rendez-vous...</div>
        ) : appointments.length === 0 ? (
          <div className="empty-state">
            <div>
              <h2>Vous n'avez aucun rendez-vous</h2>
              <p>Créez votre premier rendez-vous avec un coach pour commencer votre suivi personnalisé.</p>
            </div>
          </div>
        ) : (
          <div className="appointments-grid">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="appointment-card">
                <div className="appointment-header">
                  <div>
                    <h3 className="appointment-coach">{appointment.coach_name}</h3>
                  </div>
                  <span
                    className="appointment-status"
                    style={{ backgroundColor: getStatusColor(appointment.status) }}
                  >
                    {getStatusText(appointment.status)}
                  </span>
                </div>

                <div className="appointment-details">
                  <div className="appointment-detail">
                    <span className="appointment-label">Date</span>
                    <span className="appointment-value">
                      {new Date(appointment.date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>

                  <div className="appointment-detail">
                    <span className="appointment-label">Heure</span>
                    <span className="appointment-value">{appointment.time}</span>
                  </div>

                  {appointment.video_link && (
                    <div className="appointment-detail">
                      <span className="appointment-label">Lien vidéo</span>
                      <a
                        href={appointment.video_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="appointment-value"
                        style={{ color: '#0f766e', textDecoration: 'underline' }}
                      >
                        Rejoindre la réunion
                      </a>
                    </div>
                  )}
                </div>

                {appointment.notes && (
                  <p className="appointment-notes">"{appointment.notes}"</p>
                )}

                <div className="appointment-actions">
                  {appointment.status === 'pending' && (
                    <button
                      className="action-button confirm-button"
                      onClick={() => handleConfirmAppointment(appointment.id)}
                    >
                      Confirmer
                    </button>
                  )}

                  {appointment.status === 'confirmed' && appointment.video_link && (
                    <a
                      href={appointment.video_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-button confirm-button"
                    >
                      Rejoindre
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}