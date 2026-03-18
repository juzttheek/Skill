import "./components.css";

const Button = ({
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  type = "button",
  className = "",
  children,
  ...props
}) => {
  const variantClass = `sh-button-${variant}`;
  const sizeClass = `sh-button-${size}`;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`sh-button ${variantClass} ${sizeClass} ${className}`.trim()}
      {...props}
    >
      {loading ? <span className="sh-spinner" aria-hidden="true" /> : null}
      <span>{children}</span>
    </button>
  );
};

export default Button;
