export default function StatCard({ value, label, className = "" }) {
  return (
    <div className={`glass-card stat-card ${className}`.trim()}>
      <span className="stat-card__value">{value}</span>
      <span className="stat-card__label">{label}</span>
    </div>
  );
}

