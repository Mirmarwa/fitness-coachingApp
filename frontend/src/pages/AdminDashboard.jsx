import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  deleteAdminCoach,
  deleteAdminUser,
  getAdminCoaches,
  getAdminOverview,
  getAdminPayments,
  getAdminSubscriptions,
  getAdminUsers,
  updateAdminCoach,
  updateAdminUser,
} from "../services/api";

const TABS = [
  { id: "users", label: "Utilisateurs" },
  { id: "coaches", label: "Coachs" },
  { id: "payments", label: "Paiements" },
  { id: "subscriptions", label: "Abonnements" },
];

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("fr-FR");
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [payments, setPayments] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOverview = useCallback(async () => {
    const data = await getAdminOverview();
    setOverview(data);
  }, []);

  const loadTab = useCallback(async (tab) => {
    setLoading(true);
    try {
      if (tab === "users") {
        setUsers(await getAdminUsers());
      } else if (tab === "coaches") {
        setCoaches(await getAdminCoaches());
      } else if (tab === "payments") {
        setPayments(await getAdminPayments());
      } else if (tab === "subscriptions") {
        setSubscriptions(await getAdminSubscriptions());
      }
    } catch (error) {
      toast.error(error.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOverview().catch(() => toast.error("Impossible de charger les statistiques"));
    loadTab(activeTab);
  }, [activeTab, loadOverview, loadTab]);

  const handleUserRoleChange = async (user, newRole) => {
    try {
      await updateAdminUser(user.id, { role: newRole });
      toast.success("Utilisateur mis à jour");
      loadTab("users");
    } catch (error) {
      toast.error(error.message || "Mise à jour impossible");
    }
  };

  const handleUserStaffToggle = async (user) => {
    try {
      await updateAdminUser(user.id, { is_staff: !user.is_staff });
      toast.success("Droits staff mis à jour");
      loadTab("users");
    } catch (error) {
      toast.error(error.message || "Mise à jour impossible");
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Supprimer l'utilisateur « ${user.username} » ?`)) return;
    try {
      await deleteAdminUser(user.id);
      toast.success("Utilisateur supprimé");
      loadTab("users");
      loadOverview();
    } catch (error) {
      toast.error(error.message || "Suppression impossible");
    }
  };

  const handleCoachFieldSave = async (coach, field, value) => {
    try {
      const payload = { [field]: field === "price" || field === "experience" ? Number(value) : value };
      await updateAdminCoach(coach.id, payload);
      toast.success("Coach mis à jour");
      loadTab("coaches");
    } catch (error) {
      toast.error(error.message || "Mise à jour impossible");
    }
  };

  const handleDeleteCoach = async (coach) => {
    if (!window.confirm(`Supprimer le coach « ${coach.name || coach.username} » et son compte ?`)) return;
    try {
      await deleteAdminCoach(coach.id);
      toast.success("Coach supprimé");
      loadTab("coaches");
      loadOverview();
    } catch (error) {
      toast.error(error.message || "Suppression impossible");
    }
  };

  return (
    <main className="admin-page">
      <style>
        {`
          .admin-page {
            min-height: 100vh;
            padding: 42px 24px 60px;
            background: linear-gradient(135deg, #f8fafc 0%, #ecfdf5 50%, #ffffff 100%);
            color: #10201c;
            font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }

          .admin-container {
            width: min(1280px, 100%);
            margin: 0 auto;
          }

          .admin-header h1 {
            margin: 0;
            font-size: clamp(34px, 6vw, 48px);
            font-weight: 900;
            color: #0f172a;
          }

          .admin-header p {
            margin: 12px 0 0;
            color: #64748b;
            font-size: 16px;
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 16px;
            margin: 28px 0 32px;
          }

          .stat-card {
            padding: 22px;
            border-radius: 18px;
            background: white;
            border: 1px solid rgba(15, 118, 110, 0.12);
            box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
            text-align: center;
          }

          .stat-card strong {
            display: block;
            font-size: 32px;
            color: #0f766e;
          }

          .stat-card span {
            font-size: 13px;
            font-weight: 800;
            text-transform: uppercase;
            color: #64748b;
            letter-spacing: 0.05em;
          }

          .tab-bar {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 24px;
          }

          .tab-button {
            padding: 12px 20px;
            border: 1px solid rgba(15, 118, 110, 0.2);
            border-radius: 999px;
            background: white;
            color: #475569;
            font-size: 14px;
            font-weight: 800;
            cursor: pointer;
            transition: all 160ms ease;
          }

          .tab-button.active {
            background: #0f766e;
            border-color: #0f766e;
            color: white;
            box-shadow: 0 12px 24px rgba(15, 118, 110, 0.22);
          }

          .data-card {
            padding: 24px;
            border-radius: 22px;
            background: white;
            border: 1px solid rgba(15, 118, 110, 0.12);
            box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
            overflow-x: auto;
          }

          .data-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
          }

          .data-table th,
          .data-table td {
            padding: 12px 10px;
            text-align: left;
            border-bottom: 1px solid rgba(15, 118, 110, 0.1);
            vertical-align: middle;
          }

          .data-table th {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: #64748b;
          }

          .badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
          }

          .badge.client { background: #dbeafe; color: #1e40af; }
          .badge.coach { background: #dcfce7; color: #166534; }
          .badge.staff { background: #fef3c7; color: #92400e; }
          .badge.active { background: #d1fae5; color: #065f46; }
          .badge.expired { background: #fee2e2; color: #991b1b; }

          .btn-row {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }

          .btn-sm {
            padding: 8px 12px;
            border: 0;
            border-radius: 10px;
            font-size: 12px;
            font-weight: 800;
            cursor: pointer;
          }

          .btn-primary { background: #0f766e; color: white; }
          .btn-danger { background: #ef4444; color: white; }
          .btn-muted { background: #f1f5f9; color: #334155; }

          .loading {
            text-align: center;
            padding: 40px;
            color: #64748b;
          }

          .inline-input {
            width: 100%;
            min-width: 80px;
            padding: 6px 8px;
            border: 1px solid rgba(15, 118, 110, 0.2);
            border-radius: 8px;
            font-size: 13px;
          }
        `}
      </style>

      <div className="admin-container">
        <header className="admin-header">
          <p style={{ margin: "0 0 8px", color: "#0f766e", fontWeight: 900, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Administration
          </p>
          <h1>Tableau de bord admin</h1>
          <p>Gestion des utilisateurs, coachs, paiements et abonnements.</p>
        </header>

        {overview && (
          <div className="stats-grid">
            <div className="stat-card"><strong>{overview.users_total}</strong><span>Utilisateurs</span></div>
            <div className="stat-card"><strong>{overview.coaches_total}</strong><span>Coachs</span></div>
            <div className="stat-card"><strong>{overview.clients_total}</strong><span>Clients</span></div>
            <div className="stat-card"><strong>{overview.payments_completed}</strong><span>Paiements</span></div>
            <div className="stat-card"><strong>{overview.subscriptions_active}</strong><span>Abonnements actifs</span></div>
            <div className="stat-card"><strong>{overview.staff_users}</strong><span>Admins staff</span></div>
          </div>
        )}

        <nav className="tab-bar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <section className="data-card">
          {loading ? (
            <div className="loading">Chargement...</div>
          ) : activeTab === "users" ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Utilisateur</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Staff</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.username}</td>
                    <td>{u.email || "—"}</td>
                    <td>
                      <span className={`badge ${u.role}`}>{u.role}</span>
                    </td>
                    <td>
                      {u.is_staff ? <span className="badge staff">Staff</span> : "—"}
                    </td>
                    <td>
                      <div className="btn-row">
                        <select
                          className="inline-input"
                          value={u.role}
                          onChange={(e) => handleUserRoleChange(u, e.target.value)}
                        >
                          <option value="client">client</option>
                          <option value="coach">coach</option>
                        </select>
                        <button type="button" className="btn-sm btn-muted" onClick={() => handleUserStaffToggle(u)}>
                          {u.is_staff ? "Retirer staff" : "Staff"}
                        </button>
                        <button type="button" className="btn-sm btn-danger" onClick={() => handleDeleteUser(u)}>
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : activeTab === "coaches" ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom</th>
                  <th>Spécialité</th>
                  <th>Prix</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coaches.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.name || c.username}</td>
                    <td>
                      <input
                        className="inline-input"
                        defaultValue={c.specialty || ""}
                        onBlur={(e) => {
                          if (e.target.value !== (c.specialty || "")) {
                            handleCoachFieldSave(c, "specialty", e.target.value);
                          }
                        }}
                      />
                    </td>
                    <td>
                      <input
                        className="inline-input"
                        type="number"
                        defaultValue={c.price ?? ""}
                        onBlur={(e) => {
                          if (String(e.target.value) !== String(c.price ?? "")) {
                            handleCoachFieldSave(c, "price", e.target.value);
                          }
                        }}
                      />
                    </td>
                    <td>
                      <button type="button" className="btn-sm btn-danger" onClick={() => handleDeleteCoach(c)}>
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : activeTab === "payments" ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Client</th>
                  <th>Coach / Programme</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.username}</td>
                    <td>{p.coach_username || p.program_title || "—"}</td>
                    <td>{Number(p.amount).toFixed(2)} DH</td>
                    <td>{p.status}</td>
                    <td>{formatDate(p.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Client</th>
                  <th>Coach</th>
                  <th>Statut</th>
                  <th>Début</th>
                  <th>Fin</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((s) => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{s.user_username}</td>
                    <td>{s.coach_username}</td>
                    <td>
                      <span className={`badge ${s.status === "active" ? "active" : "expired"}`}>{s.status}</span>
                    </td>
                    <td>{formatDate(s.start_date)}</td>
                    <td>{formatDate(s.end_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </main>
  );
}
