import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { authFetchJson, API_BASE_URL } from "../services/api";

const getUserIdFromToken = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.user_id;
  } catch {
    return null;
  }
};

const RESERVED_APPOINTMENT_STATUSES = new Set([
  "pending",
  "booked",
  "confirmed",
  "completed",
]);

const coachAppointmentBadgeClass = (status) => {
  if (status === "available") return "available";
  if (status === "pending" || status === "booked") return "booked";
  if (status === "confirmed") return "confirmed";
  if (status === "completed") return "completed";
  if (status === "cancelled") return "cancelled";
  return "available";
};

const coachAppointmentStatusLabel = (status) => {
  if (status === "available") return "Disponible";
  if (status === "pending" || status === "booked") return "En attente";
  if (status === "confirmed") return "Confirmé";
  if (status === "completed") return "Terminé";
  if (status === "cancelled") return "Annulé";
  return status || "—";
};

export default function CoachDashboard() {
  const [clients, setClients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateProgram, setShowCreateProgram] = useState(false);
  const [newProgram, setNewProgram] = useState({
    title: "",
    description: "",
    duration: "30",
    price: "",
    video_url: "",
  });
  const [editingProgram, setEditingProgram] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [nutritionPlans, setNutritionPlans] = useState([]);

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
      const clientsMap = new Map();
      (Array.isArray(appointmentsRes) ? appointmentsRes : []).forEach((apt) => {
        if (!apt.client) return;
        clientsMap.set(apt.client, {
          id: apt.client,
          name: apt.client_name || `Client #${apt.client}`,
        });
      });
      setClients(Array.from(clientsMap.values()));

      // 3️⃣ Charger les programmes du coach
      const programsRes = await authFetchJson(`${API_BASE_URL}/programs/`);
      const allPrograms = Array.isArray(programsRes) ? programsRes : [];
      const currentUserId = getUserIdFromToken(localStorage.getItem("access"));

      const ownedPrograms = allPrograms.filter(
        (program) => String(program.coach) === String(currentUserId)
      );

      setPrograms(ownedPrograms);
    // Pré-remplir exercices/nutrition si on est en édition
    // (ceci aide si l'UI garde en mémoire un programme déjà chargé)
    // note: handleEditProgram gère le set réel quand on clique sur Modifier
    } catch (error) {
      setError("Impossible de charger les données du dashboard.");
      toast.error("Erreur lors du chargement du dashboard");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProgram = (program) => {
    setEditingProgram(program);
    setNewProgram({
      title: program.title || "",
      description: program.description || "",
      duration: String(program.duration || "30"),
      price: String(program.price || ""),
      video_url: program.video_url || "",
    });
    setImageFile(null);
    setVideoFile(null);
    // remplir exercices et nutrition si présents
    setExercises(Array.isArray(program.exercises) ? program.exercises.map(e => ({
      id: e.id,
      name: e.name || '',
      description: e.description || '',
      reps: e.reps || 0,
      sets: e.sets || 0,
    })) : []);
    setNutritionPlans(Array.isArray(program.nutrition_plans) ? program.nutrition_plans.map(n => ({
      id: n.id,
      title: n.title || '',
      calories: n.calories || 0,
      protein: n.protein || 0,
      carbs: n.carbs || 0,
      fats: n.fats || 0,
    })) : []);
    setShowCreateProgram(true);
  };

  const handleCancelEdit = () => {
    setEditingProgram(null);
    setShowCreateProgram(false);
    setNewProgram({ title: "", description: "", duration: "30", price: "", video_url: "" });
    setImageFile(null);
    setVideoFile(null);
    setExercises([]);
    setNutritionPlans([]);
  };

  const handleSaveProgram = async (e) => {
    if (e) e.preventDefault();
    if (!newProgram.title.trim() || !newProgram.description.trim()) {
      toast.error("Titre et description requis");
      return;
    }

    const duration = Number(newProgram.duration);
    const price = Number(newProgram.price);

    if (!Number.isFinite(duration) || duration <= 0) {
      toast.error("La durée doit être un nombre valide.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      toast.error("Le prix doit être un nombre valide.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", newProgram.title.trim());
      formData.append("description", newProgram.description.trim());
      formData.append("duration", String(duration));
      formData.append("price", String(price));
      formData.append("video_url", newProgram.video_url || "");
      
      if (imageFile) {
        formData.append("image", imageFile);
      }
      if (videoFile) {
        formData.append("video_file", videoFile);
      }

      // append exercises and nutrition as JSON strings so backend peut les parser
      if (Array.isArray(exercises) && exercises.length > 0) {
        formData.append('exercises', JSON.stringify(exercises));
      }
      if (Array.isArray(nutritionPlans) && nutritionPlans.length > 0) {
        formData.append('nutrition_plans', JSON.stringify(nutritionPlans));
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

      toast.success(editingProgram ? "Programme modifié !" : "Programme créé !");
      handleCancelEdit();
      await loadCoachData();
    } catch (error) {
      toast.error(error.message || "Erreur lors de l'enregistrement");
      console.error(error);
    }
  };

  const handleDeleteProgram = async (program) => {
    if (!window.confirm(`Supprimer le programme « ${program.title} » ?`)) return;
    try {
      const token = localStorage.getItem("access");
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/programs/${program.id}/`, {
        method: "DELETE",
        headers,
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.detail || errJson.error || "Suppression impossible");
      }

      toast.success("Programme supprimé");
      await loadCoachData();
    } catch (error) {
      toast.error(error.message || "Suppression impossible");
    }
  };

  // --- Exercises & Nutrition handlers ---
  const addExercise = () => {
    setExercises((s) => [...s, { name: '', description: '', reps: 0, sets: 0 }]);
  };
  const updateExercise = (index, field, value) => {
    setExercises((s) => s.map((it, i) => i === index ? { ...it, [field]: value } : it));
  };
  const removeExercise = (index) => {
    setExercises((s) => s.filter((_, i) => i !== index));
  };

  const addNutritionPlan = () => {
    setNutritionPlans((s) => [...s, { title: '', calories: 0, protein: 0, carbs: 0, fats: 0 }]);
  };
  const updateNutritionPlan = (index, field, value) => {
    setNutritionPlans((s) => s.map((it, i) => i === index ? { ...it, [field]: value } : it));
  };
  const removeNutritionPlan = (index) => {
    setNutritionPlans((s) => s.filter((_, i) => i !== index));
  };

  const stats = {
    clients: clients.length,
    appointments: appointments.filter((a) =>
      RESERVED_APPOINTMENT_STATUSES.has(a.status),
    ).length,
    programs: programs.length,
    revenue: "Non disponible",
  };

  const formatPrice = (value) => {
    const price = Number(value);
    if (!Number.isFinite(price) || price <= 0) return "Prix non disponible";
    return `${price.toFixed(2)} DH`;
  };

  const formatDate = (value) => {
    if (!value) return "Non disponible";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Non disponible";
    return date.toLocaleDateString("fr-FR");
  };

  return (
    <main className="coach-dashboard">
      <style>{`
        .coach-dashboard { min-height:100vh; padding:42px 24px; background: radial-gradient(circle at top right, rgba(16, 185, 129, 0.12), transparent 26%), linear-gradient(180deg, #050a11 0%, #0c1220 45%, #111821 100%); color:#e6eef0; font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif }

        .coach-container { width: min(1280px,100%); margin:0 auto }

        .coach-header { margin-bottom:36px }

        .coach-title { margin:0 0 8px; font-size: clamp(32px,6vw,48px); font-weight:900; color:#f4fff9 }

        .coach-subtitle { margin:0; color:#9fb1b0; font-size:16px }

        .stats-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(220px,1fr)); gap:20px; margin-bottom:32px }

        .stat-card { background: rgba(255,255,255,0.04); border-radius:20px; border:1px solid rgba(255,255,255,0.08); padding:24px; box-shadow:0 24px 70px rgba(0, 0, 0, 0.45); text-align:center }

        .stat-number { margin:0; font-size:36px; font-weight:900; color:#bff7e6 }

        .stat-label { margin:8px 0 0; color:#9fb1b0; font-size:13px; text-transform:uppercase; font-weight:800 }

        .section { margin-bottom:36px }

        .section-title { margin:0 0 18px; font-size:20px; font-weight:900; color:#f1fff8; border-bottom:2px solid rgba(16,185,129,0.06); padding-bottom:10px }

        .cards-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(300px,1fr)); gap:18px }

        .card { background: rgba(255,255,255,0.04); border-radius:20px; border:1px solid rgba(255,255,255,0.08); padding:22px; box-shadow:0 24px 70px rgba(0,0,0,0.45); transition: transform 200ms cubic-bezier(.16,1,.3,1) }

        .card:hover { transform: translateY(-6px); box-shadow:0 34px 88px rgba(0,0,0,0.7) }

        .card-header { display:flex; justify-content:space-between; align-items:start; margin-bottom:12px }

        .card-title { margin:0; font-size:16px; font-weight:900; color:#f1fff8 }

        .card-badge { padding:6px 10px; border-radius:8px; font-size:12px; font-weight:800 }

        .card-badge.booked { background: linear-gradient(135deg, rgba(255,242,130,0.12), rgba(255,210,112,0.04)); color:#ffefc2 }
        .card-badge.available { background: linear-gradient(135deg, rgba(221,234,255,0.06), rgba(16,143,177,0.02)); color:#cfe9ff }
        .card-badge.confirmed { background: linear-gradient(135deg, rgba(209,250,229,0.06), rgba(6,95,70,0.02)); color:#dff8ef }
        .card-badge.completed { background: rgba(255,255,255,0.02); color:#a6b3b9 }
        .card-badge.cancelled { background: linear-gradient(135deg, rgba(255,178,178,0.06), rgba(255,120,120,0.02)); color:#ffd6d6 }

        .card-content { margin:0; color:#9fb1b0; font-size:14px; line-height:1.6 }

        .progress-item { background: rgba(255,255,255,0.01); border-radius:10px; padding:10px; margin:8px 0; color:#9fb1b0 }

          .progress-weight {
            font-weight: 700;
            color: #0f766e;
          }

          .empty-state {
            text-align: center;
            padding: 40px 20px;
            color: #9fb1b0;
            background: rgba(255,255,255,0.04);
            border: 1px dashed rgba(255,255,255,0.12);
            border-radius: 20px;
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
            background: rgba(255,255,255,0.04);
            border-radius: 24px;
            border: 1px solid rgba(255,255,255,0.08);
            padding: 32px;
            margin-bottom: 42px;
            box-shadow: 0 24px 70px rgba(0,0,0,0.45);
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
            padding: 14px 16px;
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 16px;
            font-size: 14px;
            font-family: inherit;
            box-sizing: border-box;
            background: rgba(255,255,255,0.05);
            color: #eef7f1;
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
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            box-shadow: 0 18px 40px rgba(16, 185, 129, 0.24);
          }

          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 20px 44px rgba(16, 185, 129, 0.3);
          }

          .btn-secondary {
            background: rgba(255,255,255,0.08);
            color: #d5f1e0;
            border: 1px solid rgba(255,255,255,0.1);
          }

          .btn-secondary:hover {
            background: rgba(255,255,255,0.12);
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
              <h1 className="coach-title">entraineur
                🎯</h1>
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
              {/* Revenus retirés temporairement (non fonctionnel) */}
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
                  <h2 className="section-title">
                    {editingProgram ? `Modifier : ${editingProgram.title}` : "Nouveau Programme"}
                  </h2>
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
                      min="1"
                      step="1"
                      value={newProgram.duration}
                      onChange={(e) =>
                        setNewProgram({
                          ...newProgram,
                          duration: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Prix (DH)</label>
                    <input
                      className="form-input"
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="Ex: 199"
                      value={newProgram.price}
                      onChange={(e) =>
                        setNewProgram({
                          ...newProgram,
                          price: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Image de couverture</label>
                    <input
                      className="form-input"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files[0])}
                    />
                    {editingProgram?.image && (
                      <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748b" }}>
                        Image actuelle : <a href={editingProgram.image} target="_blank" rel="noreferrer" style={{ color: "#0f766e" }}>Voir l'image</a>
                      </p>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Lien Vidéo YouTube / URL</label>
                    <input
                      className="form-input"
                      type="url"
                      placeholder="Ex: https://www.youtube.com/watch?v=..."
                      value={newProgram.video_url || ""}
                      onChange={(e) =>
                        setNewProgram({
                          ...newProgram,
                          video_url: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fichier Vidéo (MP4)</label>
                    <input
                      className="form-input"
                      type="file"
                      accept="video/*"
                      onChange={(e) => setVideoFile(e.target.files[0])}
                    />
                    {editingProgram?.video_file && (
                      <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#64748b" }}>
                        Vidéo MP4 actuelle : <a href={editingProgram.video_file} target="_blank" rel="noreferrer" style={{ color: "#0f766e" }}>Voir la vidéo</a>
                      </p>
                    )}
                  </div>

                  {/* Exercices */}
                  <div className="form-group">
                    <label className="form-label">Exercices</label>
                    {exercises.length === 0 && <p style={{color:'#9fb1b0'}}>Aucun exercice ajouté.</p>}
                    {exercises.map((ex, idx) => (
                      <div key={idx} style={{marginBottom:8}}>
                        <div style={{display:'grid', gridTemplateColumns:'1fr 90px 90px auto', gap:8, alignItems:'center'}}>
                          <input className="form-input" placeholder="Nom de l'exercice" value={ex.name} onChange={e=>updateExercise(idx,'name',e.target.value)} />
                          <input className="form-input" type="number" placeholder="Reps" value={ex.reps} onChange={e=>updateExercise(idx,'reps',Number(e.target.value))} />
                          <input className="form-input" type="number" placeholder="Sets" value={ex.sets} onChange={e=>updateExercise(idx,'sets',Number(e.target.value))} />
                          <button type="button" className="btn" onClick={()=>removeExercise(idx)} style={{padding:'6px 8px'}}>Suppr</button>
                        </div>
                        <textarea className="form-textarea" placeholder="Description" value={ex.description} onChange={e=>updateExercise(idx,'description',e.target.value)} style={{marginTop:8}} />
                      </div>
                    ))}
                    <div style={{marginTop:8}}>
                      <button type="button" className="btn btn-secondary" onClick={addExercise}>+ Ajouter un exercice</button>
                    </div>
                  </div>

                  {/* Nutrition */}
                  <div className="form-group">
                    <label className="form-label">Plan nutritionnel</label>
                    {nutritionPlans.length === 0 && <p style={{color:'#9fb1b0'}}>Aucun plan nutrition ajouté.</p>}
                    {nutritionPlans.map((n, idx) => (
                      <div key={idx} style={{marginBottom:8}}>
                        <div style={{display:'grid', gridTemplateColumns:'1fr 80px 80px 80px 80px auto', gap:8, alignItems:'center'}}>
                          <input className="form-input" placeholder="Titre" value={n.title} onChange={e=>updateNutritionPlan(idx,'title',e.target.value)} />
                          <input className="form-input" type="number" placeholder="Calories" value={n.calories} onChange={e=>updateNutritionPlan(idx,'calories',Number(e.target.value))} />
                          <input className="form-input" type="number" placeholder="Protéines" value={n.protein} onChange={e=>updateNutritionPlan(idx,'protein',Number(e.target.value))} />
                          <input className="form-input" type="number" placeholder="Glucides" value={n.carbs} onChange={e=>updateNutritionPlan(idx,'carbs',Number(e.target.value))} />
                          <input className="form-input" type="number" placeholder="Lipides" value={n.fats} onChange={e=>updateNutritionPlan(idx,'fats',Number(e.target.value))} />
                          <button type="button" className="btn" onClick={()=>removeNutritionPlan(idx)} style={{padding:'6px 8px'}}>Suppr</button>
                        </div>
                      </div>
                    ))}
                    <div style={{marginTop:8}}>
                      <button type="button" className="btn btn-secondary" onClick={addNutritionPlan}>+ Ajouter un plan nutritionnel</button>
                    </div>
                  </div>

                  <div className="button-group">
                    <button
                      className="btn btn-primary"
                      onClick={handleSaveProgram}
                    >
                      {editingProgram ? "Enregistrer" : "Créer le programme"}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={handleCancelEdit}
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
                        <h3 className="card-title">
                          {client.name || "Client non disponible"}
                        </h3>
                      </div>
                      <p className="card-content">Client suivi via rendez-vous.</p>
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
                          {formatDate(apt.date)} à {apt.time || "Non disponible"}
                        </h3>
                        <span
                          className={`card-badge ${coachAppointmentBadgeClass(apt.status)}`}
                        >
                          {coachAppointmentStatusLabel(apt.status)}
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
                    <div key={prog.id} className="card" style={{ display: "flex", flexDirection: "column", gap: "12px", overflow: "hidden" }}>
                      {prog.image && (
                        <div style={{ height: "160px", margin: "-20px -20px 0 -20px", overflow: "hidden", background: "#f1f5f9" }}>
                          <img
                            src={prog.image}
                            alt={prog.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </div>
                      )}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h3 className="card-title" style={{ margin: 0 }}>{prog.title || "Programme fitness"}</h3>
                        {(prog.video_url || prog.video_file) && (
                          <span style={{ fontSize: "11px", background: "#ecfdf5", color: "#047857", padding: "4px 8px", borderRadius: "6px", fontWeight: "900" }}>
                            🎥 Vidéo
                          </span>
                        )}
                      </div>
                      <p className="card-content" style={{ flexGrow: 1 }}>
                        {prog.description || "Description non disponible"}
                      </p>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#64748b", borderTop: "1px solid #f1f5f9", paddingTop: "12px" }}>
                        <span><strong>Durée:</strong> {prog.duration || "Non disponible"} jours</span>
                        <span><strong>Prix:</strong> {formatPrice(prog.price)}</span>
                      </div>
                      <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => handleEditProgram(prog)}
                          style={{ flex: 1, padding: "8px 12px", fontSize: "13px" }}
                        >
                          Modifier
                        </button>
                        <button
                          type="button"
                          className="btn"
                          onClick={() => handleDeleteProgram(prog)}
                          style={{ flex: 1, padding: "8px 12px", fontSize: "13px", background: "#fee2e2", color: "#b91c1c", border: "1px solid rgba(185, 28, 28, 0.2)" }}
                        >
                          Supprimer
                        </button>
                      </div>
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
