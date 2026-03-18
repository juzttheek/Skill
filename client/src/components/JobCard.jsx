import Badge from "./Badge";
import Button from "./Button";
import "./components.css";

const formatDeadline = (deadline) => {
  if (!deadline) return "No deadline";
  const date = new Date(deadline);
  return Number.isNaN(date.getTime()) ? "No deadline" : date.toLocaleDateString();
};

const JobCard = ({ job = {}, onViewApply, buttonLabel = "View & Apply", variant = "grid" }) => {
  const cardClass = variant === "list" ? "sh-card sh-job-card-list" : "sh-card";

  return (
    <article className={cardClass}>
      <div className="sh-card-body">
        <h3 className="sh-job-title">{job.title || "Untitled job"}</h3>

        <div className="sh-job-meta-row">
          <Badge tone="yellow">{job.category || "General"}</Badge>
          <p className="sh-budget">${job.budget ?? 0}</p>
        </div>

        <p className="sh-muted">Deadline: {formatDeadline(job.deadline)}</p>

        <p className="sh-job-description">{job.description || "No description available."}</p>

        <div className="sh-tags">
          {(job.tags || []).map((tag) => (
            <Badge key={tag} tone="green">
              {tag}
            </Badge>
          ))}
        </div>

        <p className="sh-muted">Client: {job.client?.name || "Unknown Client"}</p>

        <div className="sh-job-action-row">
          <Button variant="primary" onClick={onViewApply}>
            {buttonLabel}
          </Button>
        </div>
      </div>
    </article>
  );
};

export default JobCard;
