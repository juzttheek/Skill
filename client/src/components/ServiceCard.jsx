import Badge from "./Badge";
import StarRating from "./StarRating";
import "./components.css";

const ServiceCard = ({ service = {} }) => {
  const image = service.images?.[0] || "https://via.placeholder.com/640x360?text=Service";
  const workerName = service.worker?.name || "Unknown Worker";
  const workerAvatar = service.worker?.avatar || "https://via.placeholder.com/80?text=U";

  return (
    <article className="sh-card">
      <div className="sh-card-media">
        <img src={image} alt={service.title || "Service"} />
      </div>

      <div className="sh-card-body">
        <Badge tone="green">{service.category || "Service"}</Badge>
        <h3 className="sh-service-title">{service.title || "Untitled service"}</h3>

        <div className="sh-worker-row">
          <div className="sh-worker-info">
            <img src={workerAvatar} alt={workerName} className="sh-worker-avatar" />
            <div>
              <p className="sh-worker-name">{workerName}</p>
              <StarRating rating={service.worker?.rating || 0} size={14} />
            </div>
          </div>
        </div>

        <p className="sh-price">Starting at ${service.price ?? 0}</p>
      </div>
    </article>
  );
};

export default ServiceCard;
