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
  getPrograms,
  authFetchJson,
  API_BASE_URL,
} from "../services/api";

const TABS = [
  { id: "users", label: "Utilisateurs" },
  { id: "coaches", label: "Coachs" },
  { id: "programs", label: "Programmes" },
  { id: "articles", label: "Articles" },
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

  // Programs CRUD states
  const [programs, setPrograms] = useState([]);
  const [editingProgram, setEditingProgram] = useState(null);
  const [showCreateProgram, setShowCreateProgram] = useState(false);
  const [programForm, setProgramForm] = useState({
    title: "",
    description: "",
    duration: 30,
    price: 0,
    video_url: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  // Articles CRUD states
  const [articles, setArticles] = useState([]);
  const [editingArticle, setEditingArticle] = useState(null);
  const [showCreateArticle, setShowCreateArticle] = useState(false);
  const [articleForm, setArticleForm] = useState({
    title: "",
    description: "",
    source: "",
    url: "",
    image: "",
  });

  const loadOverview = useCallback(async () => {
    const data = await getAdminOverview();
    setOverview(data);
  }, []);

  const loadArticles = useCallback(() => {
    const saved = localStorage.getItem("articles");
    if (saved) {
      try {
        setArticles(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    } else {
      const initial = [
        {
          id: 1,
          title: "Nutrition pour prise de masse",
          description: "Un guide réel sur le bulking, le surplus calorique et les aliments à privilégier pour construire du muscle.",
          image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80",
          source: "Healthline",
          url: "https://www.healthline.com/nutrition/bulking",
        },
        {
          id: 2,
          title: "Top 5 exercices pour débutants",
          description: "Un entraînement débutant publié par ACE Fitness avec des mouvements de base pour progresser en sécurité.",
          image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
          source: "ACE Fitness",
          url: "https://www.acefitness.org/resources/everyone/blog/3714/beginner-strength-training-workout/",
        },
        {
          id: 3,
          title: "Comment perdre du poids efficacement",
          description: "Les recommandations Mayo Clinic pour combiner alimentation, activité physique et habitudes durables.",
          image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80",
          source: "Mayo Clinic",
          url: "https://www.mayoclinic.org/healthy-lifestyle/weight-loss/basics/diet-and-exercise/hlv-20049483",
        }
      ];
      localStorage.setItem("articles", JSON.stringify(initial));
      setArticles(initial);
    }
  }, []);

  const loadTab = useCallback(async (tab) => {
    setLoading(true);
    try {
      if (tab === "users") {
        setUsers(await getAdminUsers());
      } else if (tab === "coaches") {
        setCoaches(await getAdminCoaches());
      } else if (tab === "programs") {
        setPrograms(await getPrograms());
      } else if (tab === "articles") {
        loadArticles();
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
  }, [loadArticles]);

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

  const handleSaveProgram = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", programForm.title);
      formData.append("description", programForm.description);
      formData.append("duration", String(programForm.duration));
      formData.append("price", String(programForm.price));
      formData.append("video_url", programForm.video_url || "");
      
      if (imageFile) {
        formData.append("image", imageFile);
      }
      if (videoFile) {
        formData.append("video_file", videoFile);
      }

      const token = localStorage.getItem("access");
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const url = editingProgram
        ? `${API_BASE_URL}/programs/${editingProgram.id}/`
        : `${API_BASE_URL}/programs/`;
      const method = editingProgram ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.detail || errJson.error || "Erreur lors de l'enregistrement");
      }

      toast.success(editingProgram ? "Programme modifié avec succès" : "Programme créé avec succès");
      setEditingProgram(null);
      setShowCreateProgram(false);
      setProgramForm({ title: "", description: "", duration: 30, price: 0, video_url: "" });
      setImageFile(null);
      setVideoFile(null);
      loadTab("programs");
      loadOverview();
    } catch (error) {
      toast.error(error.message || "Erreur lors de l'enregistrement");
    }
  };

  const handleDeleteProgram = async (program) => {
    if (!window.confirm(`Supprimer le programme « ${program.title} » ?`)) return;
    try {
      await authFetchJson(`${API_BASE_URL}/programs/${program.id}/`, {
        method: "DELETE",
      });
      toast.success("Programme supprimé");
      loadTab("programs");
      loadOverview();
    } catch (error) {
      toast.error(error.message || "Suppression impossible");
    }
  };

  const handleSaveArticle = (e) => {
    e.preventDefault();
    let updated;
    if (editingArticle) {
      updated = articles.map((art) =>
        art.id === editingArticle.id ? { ...art, ...articleForm } : art
      );
      toast.success("Article modifié avec succès");
    } else {
      const newArticle = {
        id: Date.now(),
        ...articleForm,
        image: articleForm.image || "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
      };
      updated = [...articles, newArticle];
      toast.success("Article créé avec succès");
    }
    localStorage.setItem("articles", JSON.stringify(updated));
    setArticles(updated);
    setEditingArticle(null);
    setShowCreateArticle(false);
    setArticleForm({ title: "", description: "", source: "", url: "", image: "" });
  };

  const handleDeleteArticle = (article) => {
    if (!window.confirm(`Supprimer l'article « ${article.title} » ?`)) return;
    const updated = articles.filter((art) => art.id !== article.id);
    localStorage.setItem("articles", JSON.stringify(updated));
    setArticles(updated);
    toast.success("Article supprimé");
  };

  return (
    <main className="admin-page">
      <style>{`
        .admin-page { min-height:100vh; padding:42px 24px 60px; background: linear-gradient(180deg, rgba(6,8,12,0.6), rgba(8,10,14,0.66)); color:#e6eef0; font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif }

        .admin-container { width: min(1280px,100%); margin:0 auto }

        .admin-header h1 { margin:0; font-size: clamp(32px,6vw,48px); font-weight:900; color:#f4fff9 }

        .admin-header p { margin:12px 0 0; color:#9fb1b0; font-size:15px }

        .stats-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(160px,1fr)); gap:16px; margin:28px 0 32px }

        .stat-card { padding:18px; border-radius:14px; background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); border:1px solid rgba(16,185,129,0.06); box-shadow:0 18px 48px rgba(2,6,23,0.6); text-align:center }

        .stat-card strong { display:block; font-size:28px; color:#bff7e6 }

        .stat-card span { font-size:13px; font-weight:800; text-transform:uppercase; color:#9fb1b0; letter-spacing:0.05em }

        .tab-bar { display:flex; flex-wrap:wrap; gap:10px; margin-bottom:24px }

        .tab-button { padding:10px 18px; border-radius:999px; background: rgba(255,255,255,0.02); color:#d6e9e3; font-size:14px; font-weight:800; border:1px solid rgba(255,255,255,0.02); cursor:pointer }

        .tab-button.active { background: linear-gradient(135deg, rgba(16,185,129,0.12), rgba(6,95,70,0.04)); color:#02140f; box-shadow:0 12px 30px rgba(16,185,129,0.12) }

        .data-card { padding:20px; border-radius:16px; background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); border:1px solid rgba(16,185,129,0.06); box-shadow:0 18px 48px rgba(2,6,23,0.6); overflow-x:auto }

        .data-table { width:100%; border-collapse:collapse; font-size:14px }

        .data-table th, .data-table td { padding:12px 10px; text-align:left; border-bottom:1px solid rgba(255,255,255,0.02); vertical-align:middle; color:#d6e9e3 }

        .data-table th { font-size:12px; text-transform:uppercase; letter-spacing:0.06em; color:#9fb1b0 }

        .badge { display:inline-block; padding:4px 10px; border-radius:999px; font-size:12px; font-weight:800; text-transform:uppercase }

        .badge.client { background: linear-gradient(135deg, rgba(221,234,255,0.06), rgba(16,143,177,0.02)); color:#cfe9ff }
        .badge.coach { background: linear-gradient(135deg, rgba(209,250,229,0.06), rgba(6,95,70,0.02)); color:#dff8ef }
        .badge.staff { background: linear-gradient(135deg, rgba(255,243,199,0.06), rgba(255,200,100,0.02)); color:#ffeac2 }
        .badge.active { background: linear-gradient(135deg, rgba(209,250,229,0.06), rgba(6,95,70,0.02)); color:#dff8ef }
        .badge.expired { background: linear-gradient(135deg, rgba(255,178,178,0.06), rgba(255,120,120,0.02)); color:#ffd6d6 }

        .btn-row { display:flex; flex-wrap:wrap; gap:8px }

        .btn-sm { padding:8px 12px; border:0; border-radius:8px; font-size:12px; font-weight:800; cursor:pointer }

        .btn-primary { background: linear-gradient(135deg,#10b981,#059669); color:#02140f }
        .btn-danger { background: linear-gradient(135deg, rgba(239,68,68,0.95), rgba(220,70,70,0.9)); color:#fff }
        .btn-muted { background: rgba(255,255,255,0.02); color:#cfe9ff }

        .loading { text-align:center; padding:40px; color:#9fb1b0 }

        .inline-input { width:100%; min-width:80px; padding:8px 10px; border-radius:8px; border:1px solid rgba(255,255,255,0.03); background: rgba(255,255,255,0.01); color:#e6f6ee }

        .admin-form-card { background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); border:1px solid rgba(16,185,129,0.06); border-radius:16px; padding:20px; margin-bottom:24px; box-shadow:0 18px 48px rgba(2,6,23,0.6) }

        .admin-form-title { font-size:16px; font-weight:800; color:#f1fff8; margin:0 0 12px; display:flex; justify-content:space-between; align-items:center }

        .form-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(200px,1fr)); gap:12px; margin-bottom:12px }

        .form-group { display:flex; flex-direction:column; gap:6px }

        .form-group label { font-size:12px; font-weight:800; color:#9fb1b0; text-transform:uppercase }

        .form-group input, .form-group textarea { padding:10px 12px; border-radius:8px; font-size:14px; border:1px solid rgba(255,255,255,0.03); background: rgba(255,255,255,0.01); color:#e6f6ee }

        .form-group input:focus, .form-group textarea:focus { border-color: rgba(16,185,129,0.18) }

        .btn-group { display:flex; gap:10px; justify-content:flex-end }

        .section-info { font-size:13px; color:#9ff2c9; margin-bottom:12px; background: linear-gradient(90deg, rgba(16,185,129,0.06), rgba(6,95,70,0.02)); padding:10px 14px; border-radius:10px; border-left:4px solid rgba(16,185,129,0.14); font-weight:500 }
      `}</style>

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
            <div>
              <div className="section-info">
                Gérer les comptes utilisateurs de la plateforme. Vous pouvez attribuer des droits administratifs ("Staff") uniquement aux coachs afin de leur permettre de vous aider à superviser la plateforme.
              </div>
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
                          {u.role === "coach" && (
                            <button type="button" className="btn-sm btn-muted" onClick={() => handleUserStaffToggle(u)}>
                              {u.is_staff ? "Retirer staff" : "Staff"}
                            </button>
                          )}
                          <button type="button" className="btn-sm btn-danger" onClick={() => handleDeleteUser(u)}>
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : activeTab === "coaches" ? (
            <div>
              <div className="section-info">
                Astuce : Cliquez directement dans les champs "Spécialité" ou "Prix" pour modifier la valeur d'un coach, puis cliquez en dehors du champ (ou appuyez sur Entrée/Tabulation) pour sauvegarder automatiquement.
              </div>
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
            </div>
          ) : activeTab === "programs" ? (
            <div>
              {/* Form to create/edit program */}
              {(showCreateProgram || editingProgram) && (
                <form onSubmit={handleSaveProgram} className="admin-form-card">
                  <div className="admin-form-title">
                    <span>{editingProgram ? "Modifier le Programme" : "Créer un Programme"}</span>
                    <button
                      type="button"
                      className="btn-sm btn-muted"
                      onClick={() => {
                        setEditingProgram(null);
                        setShowCreateProgram(false);
                        setProgramForm({ title: "", description: "", duration: 30, price: 0 });
                      }}
                    >
                      Annuler
                    </button>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Titre</label>
                      <input
                        type="text"
                        required
                        value={programForm.title}
                        onChange={(e) => setProgramForm({ ...programForm, title: e.target.value })}
                        placeholder="Ex: Prise de masse intensive"
                      />
                    </div>
                    <div className="form-group">
                      <label>Durée (jours)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={programForm.duration}
                        onChange={(e) => setProgramForm({ ...programForm, duration: Number(e.target.value) })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Prix (DH)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={programForm.price}
                        onChange={(e) => setProgramForm({ ...programForm, price: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Image de couverture (Optionnel)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files[0])}
                        style={{ border: "1px dashed rgba(15, 118, 110, 0.3)", padding: "8px", borderRadius: "10px" }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Lien Vidéo YouTube / URL (Optionnel)</label>
                      <input
                        type="text"
                        value={programForm.video_url}
                        onChange={(e) => setProgramForm({ ...programForm, video_url: e.target.value })}
                        placeholder="Ex: https://www.youtube.com/watch?v=..."
                      />
                    </div>
                    <div className="form-group">
                      <label>Fichier Vidéo MP4 (Optionnel)</label>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => setVideoFile(e.target.files[0])}
                        style={{ border: "1px dashed rgba(15, 118, 110, 0.3)", padding: "8px", borderRadius: "10px" }}
                      />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 16 }}>
                    <label>Description</label>
                    <textarea
                      required
                      rows="3"
                      value={programForm.description}
                      onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
                      placeholder="Décrivez les objectifs, le type d'entraînement..."
                    />
                  </div>
                  <div className="btn-group">
                    <button type="submit" className="btn-sm btn-primary">
                      {editingProgram ? "Enregistrer les modifications" : "Créer le Programme"}
                    </button>
                  </div>
                </form>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span className="section-info" style={{ margin: 0 }}>
                  Gérer les programmes de coaching. Les nouveaux programmes créés vous seront attribués.
                </span>
                {!showCreateProgram && !editingProgram && (
                  <button
                    type="button"
                    className="btn-sm btn-primary"
                    onClick={() => {
                      setProgramForm({ title: "", description: "", duration: 30, price: 0 });
                      setShowCreateProgram(true);
                    }}
                    style={{ whiteSpace: "nowrap", marginLeft: 16 }}
                  >
                    + Nouveau Programme
                  </button>
                )}
              </div>

              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Titre</th>
                    <th>Description</th>
                    <th>Durée</th>
                    <th>Prix</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {programs.map((p) => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td><strong>{p.title}</strong></td>
                      <td>
                        <div style={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {p.description}
                        </div>
                      </td>
                      <td>{p.duration} jours</td>
                      <td>{p.price} DH</td>
                      <td>
                        <div className="btn-row">
                          <button
                            type="button"
                            className="btn-sm btn-muted"
                            onClick={() => {
                              setEditingProgram(p);
                              setProgramForm({
                                title: p.title,
                                description: p.description,
                                duration: p.duration,
                                price: p.price,
                                video_url: p.video_url || "",
                              });
                              setImageFile(null);
                              setVideoFile(null);
                            }}
                          >
                            Modifier
                          </button>
                          <button
                            type="button"
                            className="btn-sm btn-danger"
                            onClick={() => handleDeleteProgram(p)}
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : activeTab === "articles" ? (
            <div>
              {/* Form to create/edit article */}
              {(showCreateArticle || editingArticle) && (
                <form onSubmit={handleSaveArticle} className="admin-form-card">
                  <div className="admin-form-title">
                    <span>{editingArticle ? "Modifier l'Article" : "Créer un Article"}</span>
                    <button
                      type="button"
                      className="btn-sm btn-muted"
                      onClick={() => {
                        setEditingArticle(null);
                        setShowCreateArticle(false);
                        setArticleForm({ title: "", description: "", source: "", url: "", image: "" });
                      }}
                    >
                      Annuler
                    </button>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Titre</label>
                      <input
                        type="text"
                        required
                        value={articleForm.title}
                        onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                        placeholder="Ex: Top 5 exercices abdos"
                      />
                    </div>
                    <div className="form-group">
                      <label>Source / Auteur</label>
                      <input
                        type="text"
                        required
                        value={articleForm.source}
                        onChange={(e) => setArticleForm({ ...articleForm, source: e.target.value })}
                        placeholder="Ex: Healthline, ACE Fitness..."
                      />
                    </div>
                    <div className="form-group">
                      <label>URL du site / Source</label>
                      <input
                        type="url"
                        required
                        value={articleForm.url}
                        onChange={(e) => setArticleForm({ ...articleForm, url: e.target.value })}
                        placeholder="Ex: https://..."
                      />
                    </div>
                  </div>
                  <div className="form-grid">
                    <div className="form-group" style={{ gridColumn: "span 2" }}>
                      <label>Lien de l'image (optionnel)</label>
                      <input
                        type="url"
                        value={articleForm.image}
                        onChange={(e) => setArticleForm({ ...articleForm, image: e.target.value })}
                        placeholder="Ex: https://images.unsplash.com/..."
                      />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 16 }}>
                    <label>Description / Résumé</label>
                    <textarea
                      required
                      rows="3"
                      value={articleForm.description}
                      onChange={(e) => setArticleForm({ ...articleForm, description: e.target.value })}
                      placeholder="Court résumé de l'article..."
                    />
                  </div>
                  <div className="btn-group">
                    <button type="submit" className="btn-sm btn-primary">
                      {editingArticle ? "Enregistrer les modifications" : "Créer l'Article"}
                    </button>
                  </div>
                </form>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span className="section-info" style={{ margin: 0 }}>
                  Gérer les articles de conseils et de nutrition visibles par les utilisateurs.
                </span>
                {!showCreateArticle && !editingArticle && (
                  <button
                    type="button"
                    className="btn-sm btn-primary"
                    onClick={() => {
                      setArticleForm({ title: "", description: "", source: "", url: "", image: "" });
                      setShowCreateArticle(true);
                    }}
                    style={{ whiteSpace: "nowrap", marginLeft: 16 }}
                  >
                    + Nouveau Article
                  </button>
                )}
              </div>

              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Image</th>
                    <th>Titre / Source</th>
                    <th>Description</th>
                    <th>Lien</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((art) => (
                    <tr key={art.id}>
                      <td>{art.id}</td>
                      <td>
                        <img
                          src={art.image || "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80"}
                          alt={art.title}
                          style={{ width: 60, height: 40, borderRadius: 8, objectFit: "cover" }}
                        />
                      </td>
                      <td>
                        <strong>{art.title}</strong>
                        <div style={{ fontSize: 12, color: "#64748b" }}>Par: {art.source}</div>
                      </td>
                      <td>
                        <div style={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {art.description}
                        </div>
                      </td>
                      <td>
                        <a href={art.url} target="_blank" rel="noreferrer" style={{ color: "#0f766e", fontWeight: 800, textDecoration: "none" }}>
                          Voir
                        </a>
                      </td>
                      <td>
                        <div className="btn-row">
                          <button
                            type="button"
                            className="btn-sm btn-muted"
                            onClick={() => {
                              setEditingArticle(art);
                              setArticleForm({
                                title: art.title,
                                description: art.description,
                                source: art.source,
                                url: art.url,
                                image: art.image || "",
                              });
                            }}
                          >
                            Modifier
                          </button>
                          <button
                            type="button"
                            className="btn-sm btn-danger"
                            onClick={() => handleDeleteArticle(art)}
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
