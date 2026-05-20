export default function Badge({ children, variant = "glass", className = "" }) {
  return (
    <span className={`badge badge-${variant} ${className}`.trim()}>{children}</span>
  );
}

