export default function ProgressStats({ data }) {
  if (!data || data.length === 0) {
    return null;
  }

  const weights = data.map((item) => parseFloat(item.weight));
  const currentWeight = weights[weights.length - 1];
  const initialWeight = weights[0];
  const avgWeight = (
    weights.reduce((a, b) => a + b, 0) / weights.length
  ).toFixed(1);
  const evolution = (currentWeight - initialWeight).toFixed(1);
  const evolutionPercent = ((evolution / initialWeight) * 100).toFixed(1);
  const isLosing = evolution < 0;

  return (
    <div className="progress-stats-container">
      <style>{`
        .progress-stats-container {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px;
          margin: 24px 0;
        }

        .stat-card {
          padding: 18px;
          border-radius: 16px;
          background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
          border: 1px solid rgba(16,185,129,0.06);
          box-shadow: 0 18px 48px rgba(2,6,23,0.6);
          transition: transform 260ms cubic-bezier(0.16,1,0.3,1), box-shadow 260ms ease;
        }

        .stat-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 30px 80px rgba(2,6,23,0.7), 0 0 28px rgba(16,185,129,0.06);
        }

        .stat-icon { font-size: 22px; margin-bottom: 8px; }

        .stat-label {
          margin: 0; font-size: 12px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em;
        }

        .stat-value { margin: 8px 0 0; font-size: 26px; font-weight: 900; color: #e6f6ef; }

        .stat-detail { margin: 6px 0 0; font-size: 13px; color: #9fb1b0; font-weight: 600; }

        .stat-positive { color: #9ff2c9; }
        .stat-negative { color: #ffb6b6; }

        @media (max-width: 760px) {
          .progress-stats-container { grid-template-columns: 1fr; }
          .stat-value { font-size: 22px; }
        }
      `}</style>

      <div className="stat-card">
        <div className="stat-icon">⚖️</div>
        <p className="stat-label">Poids actuel</p>
        <p className="stat-value">{currentWeight} kg</p>
      </div>

      <div className="stat-card">
        <div className="stat-icon">📊</div>
        <p className="stat-label">Poids moyen</p>
        <p className="stat-value">{avgWeight} kg</p>
      </div>

      <div className="stat-card">
        <div className="stat-icon">📝</div>
        <p className="stat-label">Entrées</p>
        <p className="stat-value">{data.length}</p>
        <p className="stat-detail">{data.length} mesures</p>
      </div>

      <div className="stat-card">
        <div className="stat-icon">{isLosing ? "📉" : "📈"}</div>
        <p className="stat-label">Évolution</p>
        <p className="stat-value">
          <span className={isLosing ? "stat-negative" : "stat-positive"}>
            {evolution > 0 ? "+" : ""}
            {evolution}
          </span>
        </p>
        <p className="stat-detail">
          <span className={isLosing ? "stat-negative" : "stat-positive"}>
            {evolutionPercent}%
          </span>
        </p>
      </div>
    </div>
  );
}
