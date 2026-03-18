import "./components.css";

const Badge = ({ tone = "green", children, className = "" }) => {
  const toneClass = `sh-badge-${tone}`;
  return <span className={`sh-badge ${toneClass} ${className}`.trim()}>{children}</span>;
};

export default Badge;
