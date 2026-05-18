import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getContacts, getConversation, sendMessage, authFetchJson, API_BASE_URL } from "../services/api";

const getUserIdFromToken = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1])).user_id;
  } catch {
    return null;
  }
};

// Format timestamps (e.g., "À l'instant", "Il y a 2 min", "Hier")
const formatTimestamp = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const secondsAgo = Math.floor((now - date) / 1000);

  if (secondsAgo < 60) return "À l'instant";
  if (secondsAgo < 3600) return `Il y a ${Math.floor(secondsAgo / 60)}m`;
  if (secondsAgo < 86400) return `Il y a ${Math.floor(secondsAgo / 3600)}h`;
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Hier";
  
  return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
};

export default function Messages() {
  const [contacts, setContacts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access");
    setCurrentUserId(token ? getUserIdFromToken(token) : null);
    loadContacts();
  }, []);

  // Auto-refresh messages every 3 seconds when a conversation is open
  useEffect(() => {
    if (!selectedUser) return;
    
    const interval = setInterval(() => {
      loadConversation(selectedUser.id);
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedUser]);

  const loadContacts = async () => {
    try {
      const data = await getContacts();
      setContacts(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Impossible de charger les conversations");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async (userId) => {
    try {
      const data = await getConversation(userId);
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
  };

  // Mark unread messages as read
  const markMessagesAsRead = async (messagesToMark) => {
    const unreadMessages = messagesToMark.filter(
      (msg) => !msg.is_read && msg.receiver === currentUserId
    );

    for (const msg of unreadMessages) {
      try {
        await authFetchJson(`${API_BASE_URL}/messages/${msg.id}/`, {
          method: "PATCH",
          body: JSON.stringify({ is_read: true }),
        });
      } catch (error) {
        console.error("Failed to mark message as read:", error);
      }
    }
  };

  const handleSelectConversation = async (user) => {
    setSelectedUser(user);
    try {
      const data = await getConversation(user.id);
      const messagesArray = Array.isArray(data) ? data : [];
      setMessages(messagesArray);
      // Mark messages as read
      await markMessagesAsRead(messagesArray);
    } catch (error) {
      toast.error("Erreur lors du chargement des messages");
      console.error(error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    try {
      console.log(selectedUser);
      await sendMessage(
  selectedUser.id,
  null,
  newMessage
);
      setNewMessage("");
      toast.success("Message envoyé");
      await loadConversation(selectedUser.id);
    } catch (error) {
      toast.error(error.message || "Erreur lors de l'envoi du message");
      console.error(error);
    }
  };

  return (
    <main className="messages-page">
      <style>
        {`
          .messages-page {
            min-height: 100vh;
            padding: 42px 24px;
            background: radial-gradient(circle at top left, rgba(16, 185, 129, 0.14), transparent 28%),
              linear-gradient(180deg, #050a11 0%, #0f172a 40%, #111924 100%);
            color: #e8f7ee;
            font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }

          .messages-container {
            width: min(1200px, 100%);
            margin: 0 auto;
            display: grid;
            grid-template-columns: 360px 1fr;
            gap: 24px;
            min-height: calc(100vh - 84px);
          }

          .conversations-list {
            background: rgba(18, 27, 40, 0.92);
            border-radius: 28px;
            border: 1px solid rgba(16, 185, 129, 0.16);
            box-shadow: 0 30px 70px rgba(0, 0, 0, 0.45);
            overflow: hidden;
          }

          .conversations-header {
            padding: 26px;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            backdrop-filter: blur(12px);
          }

          .conversations-title {
            margin: 0;
            font-size: 24px;
            font-weight: 900;
            color: #f7fffb;
          }

          .conversation-item {
            padding: 20px 24px;
            border-bottom: 1px solid rgba(255,255,255,0.04);
            cursor: pointer;
            transition: background 180ms ease, transform 180ms ease;
          }

          .conversation-item:hover,
          .conversation-item.active {
            background: rgba(16, 185, 129, 0.08);
            transform: translateX(1px);
          }

          .conversation-name {
            margin: 0 0 8px;
            font-weight: 800;
            color: #e8f7ee;
          }

          .conversation-last-message {
            margin: 0;
            color: #a8c4b9;
            font-size: 14px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .conversation-timestamp {
            margin: 10px 0 0;
            color: #7f9f8c;
            font-size: 12px;
          }

          .chat-area {
            background: rgba(12, 18, 28, 0.94);
            border-radius: 28px;
            border: 1px solid rgba(16, 185, 129, 0.16);
            box-shadow: 0 30px 70px rgba(0, 0, 0, 0.45);
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }

          .chat-header {
            padding: 26px;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            backdrop-filter: blur(12px);
          }

          .chat-title {
            margin: 0;
            font-size: 24px;
            font-weight: 900;
            color: #f4fff9;
          }

          .message-panel {
            flex: 1;
            padding: 24px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .message {
            max-width: 70%;
            padding: 16px 20px;
            border-radius: 24px;
            font-size: 15px;
            line-height: 1.7;
            box-shadow: 0 10px 28px rgba(0, 0, 0, 0.25);
          }

          .message.sent {
            align-self: flex-end;
            background: linear-gradient(135deg, #059669, #0f766e);
            color: #f4fff9;
          }

          .message.received {
            align-self: flex-start;
            background: rgba(255, 255, 255, 0.08);
            color: #e8f7ee;
            backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.08);
          }

          .message-sender {
            font-weight: 800;
            margin-bottom: 6px;
            font-size: 13px;
          }

          .message.sent .message-sender {
            color: rgba(220, 252, 231, 0.9);
          }

          .message.received .message-sender {
            color: #a8c4b9;
          }

          .message-time {
            font-size: 12px;
            margin-top: 10px;
            opacity: 0.75;
          }

          .message.sent .message-time {
            color: rgba(220, 252, 231, 0.85);
          }

          .message.received .message-time {
            color: #98a99b;
          }

          .message-input-area {
            padding: 24px;
            border-top: 1px solid rgba(255,255,255,0.05);
            display: flex;
            gap: 12px;
            background: rgba(9, 14, 22, 0.94);
          }

          .message-input {
            flex: 1;
            min-height: 56px;
            padding: 14px 18px;
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 16px;
            background: rgba(255, 255, 255, 0.05);
            color: #eef8f3;
            font-size: 16px;
            resize: none;
            box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.18);
          }

          .message-input:focus {
            outline: none;
            border-color: #10b981;
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.16);
          }

          .send-button {
            padding: 14px 24px;
            border: 0;
            border-radius: 16px;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            font-size: 15px;
            font-weight: 900;
            cursor: pointer;
            transition: transform 160ms ease, background 160ms ease;
          }

          .send-button:hover {
            transform: translateY(-2px);
            background: linear-gradient(135deg, #059669, #0d806f);
          }

          .empty-state {
            display: grid;
            place-items: center;
            height: 100%;
            text-align: center;
            color: #94a99a;
          }

          .empty-state h2 {
            margin: 0 0 10px;
            font-size: 26px;
            color: #f4fff9;
          }

          .empty-state p {
            margin: 0;
            max-width: 320px;
            line-height: 1.6;
            color: #9fb1b0;
          }

          @media (max-width: 900px) {
            .messages-container {
              grid-template-columns: 1fr;
              min-height: auto;
            }

            .conversations-list {
              display: none;
            }

            .chat-area {
              height: auto;
            }
          }
        `}
      </style>

      <div className="messages-container">
        <div className="conversations-list">
          <div className="conversations-header">
            <h1 className="conversations-title">Messages</h1>
          </div>

          {loading ? (
            <div className="empty-state">
              <div>
                <h2>Chargement...</h2>
              </div>
            </div>
          ) : contacts.length === 0 ? (
            <div className="empty-state">
              <div>
                <h2>Aucune conversation disponible.</h2>
                <p>Vous n'avez encore aucune conversation à afficher.</p>
              </div>
            </div>
          ) : (
            contacts.map((contact) => (
              <div
                key={contact.id}
                className={`conversation-item ${selectedUser?.id === contact.id ? 'active' : ''}`}
                onClick={() => handleSelectConversation(contact)}
              >
                <h3 className="conversation-name">{contact.name}</h3>
                <p className="conversation-last-message">{contact.lastMessage}</p>
                <p className="conversation-timestamp">{formatTimestamp(contact.timestamp)}</p>
              </div>
            ))
          )}
        </div>

        <div className="chat-area">
          {selectedUser ? (
            <>
              <div className="chat-header">
                <h2 className="chat-title">Conversation avec {selectedUser.name || selectedUser.username}</h2>
              </div>

              <div className="message-panel">
                {messages.length === 0 ? (
                  <div className="empty-state">
                    <div>
                      <h2>Aucun message</h2>
                      <p>Commencez la conversation avec votre coach.</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isSender = currentUserId && message.sender === currentUserId;

                    return (
                      <div
                        key={message.id}
                        className={`message ${isSender ? 'sent' : 'received'}`}
                      >
                        {!isSender && (
                          <div className="message-sender">{message.sender_name}</div>
                        )}
                        <div>{message.content}</div>
                        <div className="message-time">{formatTimestamp(message.created_at)}</div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="message-input-area">
                <textarea
                  className="message-input"
                  placeholder="Tapez votre message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  rows={1}
                />
                <button
                  className="send-button"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  Envoyer
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div>
                <h2>Sélectionnez un coach pour commencer.</h2>
                <p>Choisissez une conversation pour afficher et envoyer des messages.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}