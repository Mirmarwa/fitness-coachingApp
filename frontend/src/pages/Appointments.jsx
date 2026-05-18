import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  createAppointmentSlot,
  getAvailableSlots,
  getMyAppointments,
  bookAppointmentSlot,
  confirmAppointment,
  getUserById,
} from "../services/api";

const getUserIdFromToken = () => {
  const token = localStorage.getItem("access");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.user_id;
  } catch {
    return null;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case "available":
      return "#0ea5e9";
    case "pending":
    case "booked":
      return "#f59e0b";
    case "confirmed":
      return "#10b981";
    case "completed":
      return "#6b7280";
    case "cancelled":
      return "#ef4444";
    default:
      return "#6b7280";
  }
};

const getStatusText = (status) => {
  switch (status) {
    case "available":
      return "Disponible";
    case "pending":
    case "booked":
      return "En attente de confirmation";
    case "confirmed":
      return "Confirmé";
    case "completed":
      return "Terminé";
    case "cancelled":
      return "Annulé";
    default:
      return status || "Non disponible";
  }
};

/** RDV réservé côté client : en attente du coach (nouveau flux « pending », ancien « booked »). */
const isAwaitingCoachConfirmation = (status) =>
  status === "pending" || status === "booked";

const formatDate = (value) => {
  if (!value) return "Non disponible";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Non disponible";
  return date.toLocaleDateString("fr-FR");
};

export default function Appointments() {
  const [userRole, setUserRole] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ date: "", time: "", notes: "" });

  useEffect(() => {
    loadPage();
  }, []);

  const fetchUserRole = async () => {
    const userId = getUserIdFromToken();
    if (!userId) return null;

    try {
      const user = await getUserById(userId);
      return user.role;
    } catch (error) {
      console.error("Unable to load user role:", error);
      return null;
    }
  };

  const loadPage = async () => {
    setLoading(true);

    try {
      const role = (await fetchUserRole()) || "client";
      setUserRole(role);

      const appointmentsData = await getMyAppointments();
      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);

      if (role === "client") {
        await loadAvailableSlots();
      }
    } catch (error) {
      console.error("Appointments load failed:", error);
      toast.error("Erreur lors du chargement des rendez-vous");
      setAppointments([]);
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = async () => {
    try {
      const slots = await getAvailableSlots();
      setAvailableSlots(Array.isArray(slots) ? slots : []);
    } catch (error) {
      console.error("Available slots load failed:", error);
      toast.error("Impossible de charger les créneaux disponibles");
      setAvailableSlots([]);
    }
  };

  const loadAppointments = async () => {
    try {
      const data = await getMyAppointments();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Appointments load failed:", error);
      toast.error("Erreur lors du chargement des rendez-vous");
      setAppointments([]);
    }
  };

  const handleCreateSlot = async (e) => {
    e.preventDefault();

    if (!formData.date || !formData.time) {
      toast.error("La date et l'heure sont requises.");
      return;
    }

    try {
      await createAppointmentSlot(formData.date, formData.time, formData.notes);
      toast.success("Créneau créé avec succès !");
      setFormData({ date: "", time: "", notes: "" });
      setShowCreateForm(false);
      loadAppointments();
    } catch (error) {
      console.error("Create slot failed:", error);
      toast.error(error.message || "Erreur lors de la création du créneau");
    }
  };

  const handleBookSlot = async (appointmentId) => {
    try {
      await bookAppointmentSlot(appointmentId);
      toast.success("Rendez-vous réservé avec succès !");
      loadAvailableSlots();
      loadAppointments();
    } catch (error) {
      console.error("Book slot failed:", error);
      toast.error(error.message || "Impossible de réserver ce créneau");
    }
  };

  const handleConfirmAppointment = async (appointmentId) => {
    try {
      await confirmAppointment(appointmentId);
      toast.success("Rendez-vous confirmé !");
      loadAppointments();
    } catch (error) {
      console.error("Confirm appointment failed:", error);
      toast.error("Erreur lors de la confirmation");
    }
  };

  return (
    <main className="appointments-page">
      <style>
        {`
          .appointments-page {
            min-height: 100vh;
            padding: 42px 24px;
            background: radial-gradient(circle at top left, rgba(16, 185, 129, 0.14), transparent 26%),
              linear-gradient(180deg, #050a11 0%, #0f172a 42%, #111924 100%);
            color: #eef7f1;
            font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }

          .appointments-container {
            width: min(1100px, 100%);
            margin: 0 auto;
          }

          .appointments-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 24px;
            margin-bottom: 32px;
          }

          .appointments-title {
            margin: 0;
            font-size: clamp(34px, 6vw, 54px);
            line-height: 1;
            color: #f4fff9;
          }

          .appointments-description {
            margin: 10px 0 0;
            color: #9fb1b0;
            font-size: 16px;
            max-width: 680px;
            line-height: 1.75;
          }

          .create-button {
            padding: 14px 24px;
            border: 0;
            border-radius: 18px;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            font-size: 16px;
            font-weight: 900;
            cursor: pointer;
            transition: transform 160ms ease, background 160ms ease, box-shadow 160ms ease;
            box-shadow: 0 18px 40px rgba(16, 185, 129, 0.24);
          }

          .create-button:hover {
            transform: translateY(-2px);
            background: linear-gradient(135deg, #059669, #0d806f);
            box-shadow: 0 20px 48px rgba(16, 185, 129, 0.3);
          }

          .section {
            margin-bottom: 32px;
          }

          .section-title {
            margin: 0 0 20px;
            font-size: 26px;
            font-weight: 900;
            color: #f4fff9;
          }

          .appointments-grid {
            display: grid;
            gap: 24px;
          }

          .appointment-card,
          .slot-card {
            padding: 26px;
            border-radius: 28px;
            background: rgba(12, 18, 28, 0.94);
            border: 1px solid rgba(16, 185, 129, 0.16);
            box-shadow: 0 30px 70px rgba(0, 0, 0, 0.45);
            backdrop-filter: blur(18px);
          }

          .appointment-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 16px;
            margin-bottom: 18px;
          }

          .appointment-coach {
            margin: 0 0 6px;
            font-size: 22px;
            font-weight: 900;
            color: #f4fff9;
          }

          .appointment-status {
            padding: 8px 14px;
            border-radius: 999px;
            font-size: 13px;
            font-weight: 900;
            text-transform: uppercase;
            color: white;
            background: linear-gradient(135deg, #10b981, #059669);
            box-shadow: 0 6px 18px rgba(16, 185, 129, 0.24);
          }

          .appointment-details,
          .slot-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-bottom: 22px;
          }

          .appointment-detail,
          .slot-detail {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }

          .appointment-label {
            font-size: 13px;
            font-weight: 800;
            text-transform: uppercase;
            color: #8fb6a6;
          }

          .appointment-value,
          .slot-value {
            font-size: 16px;
            font-weight: 700;
            color: #eef7f1;
          }

          .appointment-notes {
            margin: 0 0 20px;
            padding: 18px;
            border-radius: 18px;
            background: rgba(255, 255, 255, 0.06);
            color: #c8ddce;
            font-style: italic;
          }

          .appointment-actions,
          .slot-actions {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
          }

          .action-button,
          .reserve-button {
            padding: 12px 22px;
            border: 0;
            border-radius: 16px;
            font-size: 14px;
            font-weight: 900;
            cursor: pointer;
            transition: transform 160ms ease, background 160ms ease, box-shadow 160ms ease;
          }

          .confirm-button {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            box-shadow: 0 16px 30px rgba(16, 185, 129, 0.2);
          }

          .confirm-button:hover,
          .reserve-button:hover {
            transform: translateY(-2px);
          }

          .reserve-button {
            background: linear-gradient(135deg, #0f766e, #0b6d58);
            color: white;
            box-shadow: 0 16px 30px rgba(15, 118, 110, 0.22);
          }

          .reserve-button:hover {
            background: linear-gradient(135deg, #0d6f5f, #0a6252);
          }

          .create-form {
            margin-bottom: 32px;
            padding: 28px;
            border-radius: 28px;
            background: rgba(12, 18, 28, 0.93);
            border: 1px solid rgba(16, 185, 129, 0.16);
            box-shadow: 0 30px 70px rgba(0, 0, 0, 0.45);
            backdrop-filter: blur(18px);
          }

          .form-title {
            margin: 0 0 22px;
            font-size: 24px;
            font-weight: 900;
            color: #f4fff9;
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
            gap: 10px;
          }

          .form-label {
            font-size: 15px;
            font-weight: 700;
            color: #c6efdd;
          }

          .form-input,
          .form-select,
          .form-textarea {
            padding: 14px 16px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 16px;
            background: rgba(255, 255, 255, 0.05);
            color: #eef7f1;
            font-size: 15px;
            transition: border-color 160ms ease, box-shadow 160ms ease;
          }

          .form-input:focus,
          .form-select:focus,
          .form-textarea:focus {
            outline: none;
            border-color: #10b981;
            box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.16);
          }

          .form-textarea {
            resize: vertical;
            min-height: 100px;
          }

          .form-actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
          }

          .submit-button {
            padding: 12px 24px;
            border: 0;
            border-radius: 16px;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            font-size: 16px;
            font-weight: 900;
            cursor: pointer;
            transition: transform 160ms ease, background 160ms ease, box-shadow 160ms ease;
            box-shadow: 0 18px 40px rgba(16, 185, 129, 0.24);
          }

          .submit-button:hover {
            transform: translateY(-2px);
            background: linear-gradient(135deg, #059669, #0d806f);
          }

          .cancel-form-button {
            padding: 12px 24px;
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 16px;
            background: rgba(255, 255, 255, 0.04);
            color: #c6efdd;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
            transition: background 160ms ease, border-color 160ms ease;
          }

          .cancel-form-button:hover {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(16, 185, 129, 0.24);
          }

          .empty-state {
            display: grid;
            place-items: center;
            min-height: 240px;
            padding: 32px 24px;
            background: rgba(255, 255, 255, 0.04);
            border: 1px dashed rgba(255, 255, 255, 0.12);
            border-radius: 22px;
            text-align: center;
          }

          .empty-state h2 {
            margin: 0 0 10px;
            color: #f4fff9;
            font-size: 25px;
          }

          .empty-state p {
            margin: 0;
            color: #9fb1b0;
            line-height: 1.6;
          }

          .loading {
            text-align: center;
            padding: 40px;
            color: #94a99a;
          }

          .live-session-banner {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 16px;
            padding: 18px 22px;
            background: rgba(16, 185, 129, 0.08);
            border: 1px solid rgba(16, 185, 129, 0.22);
            border-radius: 20px;
            margin-bottom: 20px;
            box-shadow: 0 12px 28px rgba(16, 185, 129, 0.08);
          }

          .live-session-info {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }

          .live-badge {
            display: inline-flex;
            align-items: center;
            align-self: flex-start;
            padding: 6px 12px;
            background: #ef4444;
            color: white;
            font-size: 11px;
            font-weight: 900;
            border-radius: 999px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            animation: blink 2s infinite ease-in-out;
          }

          .live-session-info p {
            margin: 0;
            font-size: 14px;
            color: #c6efdd;
            font-weight: 600;
          }

          .join-session-btn {
            display: inline-flex;
            align-items: center;
            padding: 10px 18px;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            font-size: 14px;
            font-weight: 900;
            text-decoration: none;
            border-radius: 14px;
            box-shadow: 0 6px 18px rgba(16, 185, 129, 0.25);
            transition: transform 160ms ease, background 160ms ease, box-shadow 160ms ease;
            white-space: nowrap;
          }

          .join-session-btn:hover {
            transform: translateY(-2px);
            background: linear-gradient(135deg, #059669, #0d806f);
            box-shadow: 0 8px 22px rgba(16, 185, 129, 0.32);
          }

          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
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

            .appointment-details,
            .slot-details {
              grid-template-columns: 1fr;
            }

            .live-session-banner {
              flex-direction: column;
              align-items: stretch;
              text-align: center;
              gap: 12px;
            }

            .live-badge {
              align-self: center;
            }
          }
        `}
      </style>

      <div className="appointments-container">
        <header className="appointments-header">
          <div>
            <h1 className="appointments-title">
              {userRole === "coach" ? "Mes rendez-vous" : "Réservez un créneau"}
            </h1>
            <p className="appointments-description">
              {userRole === "coach"
                ? "Créez des créneaux disponibles et suivez les réservations de vos clients."
                : "Choisissez un créneau disponible et réservez votre séance avec un coach."}
            </p>
          </div>

          {userRole === "coach" && (
            <button
              className="create-button"
              onClick={() => setShowCreateForm((prev) => !prev)}
            >
              {showCreateForm ? "Annuler" : "Nouveau créneau"}
            </button>
          )}
        </header>

        {userRole === "coach" && showCreateForm && (
          <form className="create-form" onSubmit={handleCreateSlot}>
            <h2 className="form-title">Créer un créneau disponible</h2>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="date">
                  Date
                </label>
                <input
                  id="date"
                  type="date"
                  className="form-input"
                  value={formData.date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="time">
                  Heure
                </label>
                <input
                  id="time"
                  type="time"
                  className="form-input"
                  value={formData.time}
                  onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="notes">
                Notes (optionnel)
              </label>
              <textarea
                id="notes"
                className="form-textarea"
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Ajoutez des informations sur votre séance..."
              />
            </div>

            <div className="form-actions">
              <button type="button" className="cancel-form-button" onClick={() => setShowCreateForm(false)}>
                Annuler
              </button>
              <button type="submit" className="submit-button">
                Créer le créneau
              </button>
            </div>
          </form>
        )}

        {userRole === "client" && (
          <section className="section">
            <h2 className="section-title">Créneaux disponibles</h2>

            {loading ? (
              <div className="loading">Chargement des créneaux...</div>
            ) : availableSlots.length === 0 ? (
              <div className="empty-state">
                <div>
                  <h2>Aucun créneau disponible</h2>
                  <p>Patientez pendant que les coachs ajoutent de nouveaux créneaux.</p>
                </div>
              </div>
            ) : (
              <div className="appointments-grid">
                {availableSlots.map((slot) => (
                  <div key={slot.id} className="slot-card">
                    <div className="appointment-header">
                      <div>
                        <h3 className="appointment-coach">
                          {slot.coach_name || "Coach non disponible"}
                        </h3>
                      </div>
                      <span className="appointment-status" style={{ backgroundColor: getStatusColor(slot.status) }}>
                        {getStatusText(slot.status)}
                      </span>
                    </div>

                    <div className="slot-details">
                      <div className="slot-detail">
                        <span className="appointment-label">Date</span>
                        <span className="slot-value">
                          {formatDate(slot.date)}
                        </span>
                      </div>

                      <div className="slot-detail">
                        <span className="appointment-label">Heure</span>
                        <span className="slot-value">{slot.time || "Non disponible"}</span>
                      </div>
                    </div>

                    {slot.notes && <p className="appointment-notes">"{slot.notes}"</p>}

                    <div className="slot-actions">
                      <button className="reserve-button" onClick={() => handleBookSlot(slot.id)}>
                        Réserver
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <section className="section">
          <h2 className="section-title">{userRole === "coach" ? "Vos rendez-vous" : "Mes rendez-vous"}</h2>

          {loading ? (
            <div className="loading">Chargement des rendez-vous...</div>
          ) : appointments.length === 0 ? (
            <div className="empty-state">
              <div>
                <h2>Aucun rendez-vous</h2>
                <p>
                  {userRole === "coach"
                    ? "Vos rendez-vous apparaîtront ici lorsque des clients réserveront un créneau."
                    : "Réservez un créneau pour voir votre rendez-vous ici."}
                </p>
              </div>
            </div>
          ) : (
            <div className="appointments-grid">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="appointment-card">
                  <div className="appointment-header">
                    <div>
                      <h3 className="appointment-coach">
                        {userRole === "coach"
                          ? appointment.client_name || "Client non disponible"
                          : appointment.coach_name || "Coach non disponible"}
                      </h3>
                    </div>
                    <span className="appointment-status" style={{ backgroundColor: getStatusColor(appointment.status) }}>
                      {getStatusText(appointment.status)}
                    </span>
                  </div>

                  <div className="appointment-details">
                    <div className="appointment-detail">
                      <span className="appointment-label">Date</span>
                      <span className="appointment-value">
                        {formatDate(appointment.date)}
                      </span>
                    </div>

                    <div className="appointment-detail">
                      <span className="appointment-label">Heure</span>
                      <span className="appointment-value">
                        {appointment.time || "Non disponible"}
                      </span>
                    </div>

                  </div>

                  {appointment.notes && <p className="appointment-notes">"{appointment.notes}"</p>}

                  {["confirmed", "pending", "booked"].includes(appointment.status) && appointment.video_link && (
                    <div className="live-session-banner">
                      <div className="live-session-info">
                        <span className="live-badge">🔴 Séance en direct</span>
                        <p>{userRole === "coach" ? "Rejoignez votre client pour votre cours vidéo." : "Rejoignez votre coach pour votre cours vidéo."}</p>
                      </div>
                      <a
                        href={appointment.video_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="join-session-btn"
                      >
                        🎥 Rejoindre la séance
                      </a>
                    </div>
                  )}

                  <div className="appointment-actions">
                    {userRole === "coach" && isAwaitingCoachConfirmation(appointment.status) && (
                      <button className="action-button confirm-button" onClick={() => handleConfirmAppointment(appointment.id)}>
                        Confirmer le rendez-vous
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
