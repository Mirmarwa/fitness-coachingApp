export default function Loader({ size = "md", label }) {
  return (
    <div className="page-loader">
      <div className={size === "lg" ? "loader loader-lg" : "loader"} />
      {label && <span>{label}</span>}
    </div>
  );
}

