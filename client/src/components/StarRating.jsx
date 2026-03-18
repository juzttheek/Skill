import "./components.css";

const StarRating = ({ rating = 0, size = 16, interactive = false, onChange }) => {
  const rounded = Math.round(Number(rating) || 0);

  return (
    <div className="sh-stars" aria-label={`Rating: ${rounded} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= rounded;
        const starClass = `sh-star ${filled ? "filled" : ""}`.trim();

        if (interactive) {
          return (
            <button
              key={star}
              type="button"
              className="sh-star-btn"
              onClick={() => onChange?.(star)}
              aria-label={`Set rating to ${star}`}
            >
              <span className={starClass} style={{ fontSize: size }}>
                ★
              </span>
            </button>
          );
        }

        return (
          <span key={star} className={starClass} style={{ fontSize: size }}>
            ★
          </span>
        );
      })}
    </div>
  );
};

export default StarRating;
