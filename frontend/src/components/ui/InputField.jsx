export default function InputField({
  id,
  label,
  type = "text",
  className = "",
  ...props
}) {
  return (
    <div className={`form-group ${className}`.trim()}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
        </label>
      )}
      <input id={id} type={type} className="form-input" {...props} />
    </div>
  );
}

