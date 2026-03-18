import "./components.css";

const Input = ({
  label,
  name,
  type = "text",
  placeholder = "",
  error,
  register,
  ...props
}) => {
  const registerProps = register && name ? register(name) : {};

  return (
    <div className="sh-input-wrap">
      {label ? (
        <label htmlFor={name} className="sh-input-label">
          {label}
        </label>
      ) : null}
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        className={`sh-input ${error ? "sh-input-error" : ""}`.trim()}
        {...registerProps}
        {...props}
      />
      {error ? <p className="sh-input-error-text">{error}</p> : null}
    </div>
  );
};

export default Input;
