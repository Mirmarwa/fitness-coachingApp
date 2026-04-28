import { useState } from "react";
import toast from "react-hot-toast";

const COACH_IMAGE =
  "https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=1200&q=80";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80";

const COACH_SESSION_AMOUNT = 250;
const COACH_SUBSCRIPTION_DAYS = 30;

export default function Coach() {
  const [message, setMessage] = useState("");
  const [contactForm, setContactForm] = useState({
    name: "",
    subject: "",
    text: "",
  });
  const [coachPaid, setCoachPaid] = useState(
    localStorage.getItem("coach_session_paid") === "true"
  );
  const [payingCoach, setPayingCoach] = useState(false);
  const [coachSubscriptionEnd, setCoachSubscriptionEnd] = useState(
    localStorage.getItem("coach_subscription_end") || ""
  );

  const isCoachSubscriptionActive =
    coachPaid &&
    (!coachSubscriptionEnd || new Date(coachSubscriptionEnd) >= new Date());

  const handleContact = (event) => {
    event.preventDefault();

    if (!contactForm.name.trim() || !contactForm.text.trim()) {
      toast.error("Ajoute ton nom et ton message avant l'envoi");
      return;
    }

    const savedMessages = JSON.parse(
      localStorage.getItem("coach_messages") || "[]"
    );

    localStorage.setItem(
      "coach_messages",
      JSON.stringify([
        ...savedMessages,
        {
          ...contactForm,
          date: new Date().toISOString(),
        },
      ])
    );

    setMessage("Votre message a été envoyé au coach.");
    setContactForm({ name: "", subject: "", text: "" });
    toast.success("Message envoyé au coach");
  };

  const handleCoachPayment = () => {
    if (coachPaid || payingCoach) return;

    setPayingCoach(true);

    window.setTimeout(() => {
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + COACH_SUBSCRIPTION_DAYS);

      localStorage.setItem("coach_session_paid", "true");
      localStorage.setItem("coach_session_amount", String(COACH_SESSION_AMOUNT));
      localStorage.setItem("coach_subscription_start", startDate.toISOString());
      localStorage.setItem("coach_subscription_end", endDate.toISOString());

      setCoachPaid(true);
      setCoachSubscriptionEnd(endDate.toISOString());
      setPayingCoach(false);
      setMessage("Paiement confirmé. Votre séance coach premium est activée.");
      toast.success("Paiement coach confirmé");
    }, 900);
  };

  const formatDate = (value) => {
    if (!value) return "Non définie";
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(value));
  };

  const handleVideoCall = () => {
    setMessage("Lancement de la session avec le coach...");
    window.open("https://meet.google.com", "_blank");
  };

  return (
    <main className="coach-page">
      <style>
        {`
          .coach-page {
            min-height: 100vh;
            padding: 42px 24px 56px;
            background: linear-gradient(135deg, #f8fafc 0%, #ecfdf5 50%, #ffffff 100%);
            color: #10201c;
            font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }

          .coach-container {
            width: min(1160px, 100%);
            margin: 0 auto;
          }

          .coach-hero {
            display: grid;
            grid-template-columns: 0.95fr 1.05fr;
            overflow: hidden;
            border-radius: 28px;
            background: white;
            border: 1px solid rgba(15, 118, 110, 0.12);
            box-shadow: 0 26px 75px rgba(15, 23, 42, 0.12);
          }

          .coach-image {
            width: 100%;
            height: 100%;
            min-height: 520px;
            display: block;
            object-fit: cover;
          }

          .coach-content {
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 46px;
          }

          .coach-kicker {
            margin: 0 0 10px;
            color: #0f766e;
            font-size: 13px;
            font-weight: 900;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          .coach-content h1 {
            margin: 0;
            color: #0f172a;
            font-size: clamp(36px, 6vw, 58px);
            line-height: 1;
          }

          .coach-speciality {
            display: inline-flex;
            width: fit-content;
            margin: 18px 0;
            padding: 9px 13px;
            border-radius: 999px;
            background: #dcfce7;
            color: #166534;
            font-size: 14px;
            font-weight: 900;
          }

          .coach-description {
            margin: 0 0 26px;
            color: #52645f;
            font-size: 17px;
            line-height: 1.75;
          }

          .coach-actions {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
          }

          .coach-button {
            min-height: 48px;
            padding: 0 18px;
            border: 0;
            border-radius: 15px;
            background: #0f766e;
            color: white;
            box-shadow: 0 16px 32px rgba(15, 118, 110, 0.24);
            cursor: pointer;
            font-size: 15px;
            font-weight: 900;
            transition: transform 160ms ease, background 160ms ease, box-shadow 160ms ease;
          }

          .coach-button.secondary {
            background: #ecfdf5;
            color: #0f766e;
            box-shadow: inset 0 0 0 1px rgba(15, 118, 110, 0.14);
          }

          .coach-button:hover {
            transform: translateY(-2px);
            background: #115e59;
            box-shadow: 0 20px 38px rgba(15, 118, 110, 0.28);
          }

          .coach-button.secondary:hover {
            background: #d1fae5;
            color: #115e59;
            box-shadow: inset 0 0 0 1px rgba(15, 118, 110, 0.18);
          }

          .coach-message {
            margin: 22px 0 0;
            padding: 14px 16px;
            border-radius: 16px;
            background: #f0fdfa;
            color: #0f766e;
            font-weight: 800;
          }

          .coach-sections {
            display: grid;
            grid-template-columns: 1.1fr 0.9fr;
            gap: 22px;
            margin-top: 24px;
          }

          .coach-panel {
            padding: 24px;
            border-radius: 22px;
            background: rgba(255, 255, 255, 0.94);
            border: 1px solid rgba(15, 118, 110, 0.12);
            box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
          }

          .coach-panel h2 {
            margin: 0 0 8px;
            color: #0f172a;
            font-size: 24px;
          }

          .coach-panel p {
            margin: 0 0 18px;
            color: #52645f;
            line-height: 1.7;
          }

          .coach-form {
            display: grid;
            gap: 12px;
          }

          .coach-input,
          .coach-textarea {
            width: 100%;
            box-sizing: border-box;
            border: 1px solid #d1fae5;
            border-radius: 14px;
            background: #f8fafc;
            color: #0f172a;
            font: inherit;
            outline: none;
          }

          .coach-input {
            min-height: 46px;
            padding: 0 14px;
          }

          .coach-textarea {
            min-height: 128px;
            padding: 13px 14px;
            resize: vertical;
          }

          .coach-price {
            display: flex;
            align-items: baseline;
            gap: 10px;
            margin: 18px 0;
          }

          .coach-price strong {
            color: #0f766e;
            font-size: 34px;
          }

          .coach-price span {
            color: #64748b;
            font-weight: 800;
          }

          .coach-benefits {
            display: grid;
            gap: 10px;
            margin: 0 0 20px;
            padding: 0;
            list-style: none;
          }

          .coach-benefits li {
            padding: 11px 13px;
            border-radius: 14px;
            background: #f8fafc;
            border: 1px solid #d1fae5;
            color: #334155;
            font-weight: 750;
          }

          .coach-paid-badge {
            display: inline-flex;
            margin-top: 14px;
            padding: 9px 12px;
            border-radius: 999px;
            background: #dcfce7;
            color: #166534;
            font-size: 14px;
            font-weight: 900;
          }

          .coach-locked-note {
            margin: 0;
            padding: 14px 16px;
            border-radius: 16px;
            background: #f8fafc;
            border: 1px dashed rgba(15, 118, 110, 0.28);
            color: #64748b;
            font-weight: 800;
          }

          @media (max-width: 860px) {
            .coach-hero {
              grid-template-columns: 1fr;
            }

            .coach-image {
              min-height: 320px;
            }

            .coach-content {
              padding: 30px;
            }

            .coach-sections {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>

      <div className="coach-container">
        <section className="coach-hero">
          <img
            className="coach-image"
            src={COACH_IMAGE}
            alt="Coach sportif professionnel"
            onError={(event) => {
              event.currentTarget.src = FALLBACK_IMAGE;
            }}
          />

          <div className="coach-content">
            <p className="coach-kicker">Coach certifié</p>
            <h1>Yassine El Amrani</h1>
            <span className="coach-speciality">
              Spécialisation : prise de masse, perte de poids et suivi débutant
            </span>
            <p className="coach-description">
              Un accompagnement clair et motivant pour transformer tes objectifs
              en plan d'action concret : entraînement, nutrition, progression et
              ajustements semaine après semaine.
            </p>

            {isCoachSubscriptionActive ? (
              <div className="coach-actions">
                <button
                  type="button"
                  className="coach-button secondary"
                  onClick={handleVideoCall}
                >
                  Démarrer appel vidéo
                </button>
              </div>
            ) : (
              <p className="coach-locked-note">
                L'appel vidéo sera disponible après le paiement du coach.
              </p>
            )}

            {message && <div className="coach-message">{message}</div>}
          </div>
        </section>

        <section className="coach-sections">
          <div className="coach-panel">
            <h2>Envoyer un message</h2>
            <p>
              Explique ton objectif, ton niveau et ce que tu veux améliorer. Le
              message est sauvegardé localement pour la démo.
            </p>

            <form className="coach-form" onSubmit={handleContact}>
              <input
                className="coach-input"
                type="text"
                placeholder="Votre nom"
                value={contactForm.name}
                onChange={(event) =>
                  setContactForm({ ...contactForm, name: event.target.value })
                }
              />
              <input
                className="coach-input"
                type="text"
                placeholder="Sujet du message"
                value={contactForm.subject}
                onChange={(event) =>
                  setContactForm({ ...contactForm, subject: event.target.value })
                }
              />
              <textarea
                className="coach-textarea"
                placeholder="Votre message au coach"
                value={contactForm.text}
                onChange={(event) =>
                  setContactForm({ ...contactForm, text: event.target.value })
                }
              />
              <button type="submit" className="coach-button">
                Contacter le coach
              </button>
            </form>
          </div>

          <div className="coach-panel">
            <h2>Paiement coach</h2>
            <p>
              Active une séance premium avec suivi personnalisé, appel vidéo et
              ajustement de programme.
            </p>
            <div className="coach-price">
              <strong>{COACH_SESSION_AMOUNT} DH</strong>
              <span>abonnement coach {COACH_SUBSCRIPTION_DAYS} jours</span>
            </div>
            <ul className="coach-benefits">
              <li>Analyse de votre objectif</li>
              <li>Plan d'action personnalisé</li>
              <li>Suivi via message et appel vidéo</li>
            </ul>
            {coachPaid ? (
              <span className="coach-paid-badge">
                Paiement coach confirmé jusqu'au {formatDate(coachSubscriptionEnd)}
              </span>
            ) : (
              <button
                type="button"
                className="coach-button"
                onClick={handleCoachPayment}
                disabled={payingCoach}
              >
                {payingCoach ? "Paiement en cours..." : "Payer la séance coach"}
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
