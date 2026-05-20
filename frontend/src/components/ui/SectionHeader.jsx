export default function SectionHeader({ kicker, title, description, className = "" }) {
  return (
    <header className={`section-header ${className}`.trim()}>
      {kicker && <p className="section-header__kicker">{kicker}</p>}
      <h2 className="section-header__title">{title}</h2>
      {description && <p className="section-header__desc">{description}</p>}
    </header>
  );
}

