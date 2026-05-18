import { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../services/api";

const defaultWelcome =
  "Salut ! Je suis FitCoach IA, ton assistant fitness. Pose-moi une question sur perte de poids, alimentation, entraînement, motivation ou récupération.";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", text: defaultWelcome },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const appendMessage = (newMessage) => {
    setMessages((current) => [...current, newMessage]);
  };

  const sendMessage = async (event) => {
    if (event) event.preventDefault();
    if (!message.trim()) return;

    const userText = message.trim();
    setMessage("");
    setError("");
    appendMessage({ role: "user", text: userText });
    setIsTyping(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userText }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Erreur réseau" );
      }

      const body = await response.json();
      appendMessage({
        role: "assistant",
        text:
          body.answer ||
          "Désolé, je n’ai pas pu générer de réponse. Essaie une autre question fitness.",
      });
    } catch (err) {
      console.error(err);
      appendMessage({
        role: "assistant",
        text: "Je ne peux pas répondre pour le moment. Réessaye dans un instant.",
      });
      setError("Impossible de contacter l’assistant. Vérifie le serveur.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage(event);
    }
  };

  return (
    <div className={`chatbot-widget ${isOpen ? "open" : ""}`}>
      <button
        type="button"
        className="chatbot-toggle"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? "Fermer le chatbot" : "Ouvrir le chatbot FitCoach"}
      >
        <span className="chatbot-icon">IA</span>
        <span className="chatbot-label">
          <strong>FitCoach AI</strong>
          <small>{isOpen ? "Prêt pour ta prochaine question" : "Conseil fitness instantané"}</small>
        </span>
      </button>

      <div className="chatbot-panel" aria-hidden={!isOpen}>
        <div className="chatbot-header">
          <div className="chatbot-avatar">IA</div>
          <div>
            <p className="chatbot-title">Assistant fitness</p>
            <p className="chatbot-subtitle">Court, motivant et axé sur tes objectifs.</p>
          </div>
        </div>

        <div className="chatbot-body">
          <div className="chatbot-messages" role="log" aria-live="polite">
            {messages.map((item, index) => (
              <div
                key={`${item.role}-${index}`}
                className={`message-row ${item.role === "user" ? "user" : "assistant"}`}
              >
                {item.role === "assistant" && <span className="message-avatar">IA</span>}
                <div className={`message-bubble ${item.role}`}>
                  {item.text}
                </div>
                {item.role === "user" && <span className="message-avatar user-avatar">Moi</span>}
              </div>
            ))}
            {isTyping && (
              <div className="message-row assistant typing-row">
                <span className="message-avatar">IA</span>
                <div className="message-bubble assistant typing-bubble">
                  <span className="typing-text">FitCoach AI écrit</span>
                  <span className="typing-dots" aria-hidden="true">
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-form" onSubmit={sendMessage}>
            <textarea
              className="chatbot-input"
              placeholder="Pose une question fitness..."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
            />
            <button type="submit" className="chatbot-send" disabled={!message.trim() || isTyping}>
              Envoyer
            </button>
          </form>
          {error && <p className="chatbot-error">{error}</p>}
        </div>
      </div>

      <style>{`
        .chatbot-widget {
          position: fixed;
          right: 22px;
          bottom: 22px;
          width: min(380px, calc(100vw - 32px));
          z-index: 2000;
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .chatbot-toggle {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 18px;
          border-radius: 24px;
          border: 1px solid rgba(16, 185, 129, 0.22);
          background: rgba(7, 10, 18, 0.96);
          color: #eef7f1;
          box-shadow: 0 22px 60px rgba(0, 0, 0, 0.25);
          transition: transform 180ms ease, background 180ms ease;
          cursor: pointer;
        }

        .chatbot-toggle:hover {
          transform: translateY(-1px);
          background: rgba(11, 16, 28, 0.98);
        }

        .chatbot-icon {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #10b981, #047857);
          color: #ffffff;
          font-weight: 800;
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.24);
        }

        .chatbot-label strong {
          display: block;
          color: #f4fff9;
          font-size: 14px;
          line-height: 1.2;
        }

        .chatbot-label small {
          display: block;
          margin-top: 2px;
          color: #a6b3b0;
          font-size: 12px;
        }

        .chatbot-panel {
          margin-top: 14px;
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          transform: translateY(8px);
          transition: all 220ms ease;
          pointer-events: none;
        }

        .chatbot-widget.open .chatbot-panel {
          max-height: 580px;
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        .chatbot-header {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 18px 20px 14px;
          background: rgba(16, 24, 35, 0.96);
          border-bottom: 1px solid rgba(16, 185, 129, 0.16);
        }

        .chatbot-avatar {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.24), rgba(6, 95, 70, 0.18));
          color: #f4fff9;
          display: grid;
          place-items: center;
          font-weight: 800;
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06);
        }

        .chatbot-title {
          margin: 0;
          color: #f4fff9;
          font-size: 15px;
          font-weight: 900;
        }

        .chatbot-subtitle {
          margin: 4px 0 0;
          color: #9fb1b0;
          font-size: 13px;
          line-height: 1.5;
        }

        .chatbot-body {
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding: 18px 18px 16px;
          background: rgba(4, 7, 14, 0.95);
          border: 1px solid rgba(16, 185, 129, 0.08);
          border-top: none;
          border-radius: 0 0 26px 26px;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.28);
        }

        .chatbot-messages {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 300px;
          overflow-y: auto;
          padding-right: 4px;
          scrollbar-width: thin;
        }

        .chatbot-messages::-webkit-scrollbar {
          width: 6px;
        }

        .chatbot-messages::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.25);
          border-radius: 999px;
        }

        .message-row {
          display: flex;
          align-items: flex-end;
          gap: 10px;
        }

        .message-row.user {
          justify-content: flex-end;
        }

        .message-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.18);
          color: #e6fff6;
          display: grid;
          place-items: center;
          font-size: 12px;
          font-weight: 800;
          flex-shrink: 0;
        }

        .user .message-avatar {
          background: rgba(255, 255, 255, 0.08);
          color: #cbd5e1;
        }

        .message-bubble {
          max-width: 82%;
          border-radius: 18px;
          padding: 14px 16px;
          line-height: 1.6;
          font-size: 14px;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .message-bubble.assistant {
          background: rgba(16, 185, 129, 0.14);
          color: #eef7f1;
          border: 1px solid rgba(16, 185, 129, 0.18);
        }

        .message-bubble.user {
          background: rgba(255, 255, 255, 0.08);
          color: #f8fafc;
          border: 1px solid rgba(255, 255, 255, 0.12);
        }

        .typing-bubble {
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }

        .typing-text {
          color: #dff8ef;
          font-weight: 600;
        }

        .typing-dots {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .typing-dots span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #dff8ef;
          opacity: 0.4;
          animation: blink 1.2s infinite ease-in-out;
        }

        .typing-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes blink {
          0%, 80%, 100% { opacity: 0.3; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-2px); }
        }

        .chatbot-form {
          display: flex;
          gap: 12px;
          align-items: flex-end;
          width: 100%;
          flex-wrap: wrap;
        }

        .chatbot-input {
          flex: 1;
          min-height: 54px;
          resize: none;
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
          color: #eef7f1;
          padding: 14px 16px;
          font-size: 14px;
          outline: none;
          font-family: inherit;
        }

        .chatbot-input:focus {
          border-color: rgba(16, 185, 129, 0.4);
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
        }

        .chatbot-send {
          min-width: 96px;
          border: none;
          border-radius: 16px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: #07120f;
          font-weight: 800;
          padding: 14px 18px;
          cursor: pointer;
          transition: transform 180ms ease, box-shadow 180ms ease;
          box-shadow: 0 14px 30px rgba(16, 185, 129, 0.2);
        }

        .chatbot-send:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 16px 34px rgba(16, 185, 129, 0.28);
        }

        .chatbot-send:disabled {
          cursor: default;
          opacity: 0.6;
          box-shadow: none;
        }

        .chatbot-error {
          margin: 0;
          color: #f8b4b4;
          font-size: 12px;
          line-height: 1.4;
        }

        @media (max-width: 520px) {
          .chatbot-widget {
            right: 12px;
            bottom: 12px;
          }

          .chatbot-panel {
            width: 100vw;
            max-width: 100vw;
            margin-right: -12px;
          }

          .chatbot-toggle {
            padding: 12px 14px;
          }

          .chatbot-form {
            flex-direction: column;
          }

          .chatbot-send {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Chatbot;
