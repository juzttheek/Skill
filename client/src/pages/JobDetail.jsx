import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Badge from "../components/Badge";
import Button from "../components/Button";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import StarRating from "../components/StarRating";
import { useAuth } from "../context/AuthContext";
import "./JobDetail.css";

const formatDate = (value) => {
  if (!value) return "Not specified";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not specified" : date.toLocaleDateString();
};

const statusTone = {
  open: "green",
  "in-progress": "yellow",
  completed: "gray",
  cancelled: "gray",
};

const JobDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [expanded, setExpanded] = useState({});

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      coverLetter: "",
      proposedRate: "",
      estimatedTime: "",
    },
  });

  const currentUserId = user?.id || user?._id;
  const isOwner = user && job && user.role === "client" && currentUserId === job.client?._id;
  const isWorker = user && user.role === "worker";
  const alreadyApplied = Boolean(job?.workerApplicationStatus);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/jobs/${id}`);
        setJob(response.data);
      } catch (error) {
        setJob(null);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!isOwner) {
        setApplications([]);
        return;
      }

      try {
        const response = await axiosInstance.get(`/api/jobs/${id}/applications`);
        setApplications(response.data || []);
      } catch (error) {
        setApplications([]);
      }
    };

    fetchApplications();
  }, [id, isOwner]);

  const joinedDate = useMemo(() => {
    if (!job?.client?.createdAt) return "";
    return formatDate(job.client.createdAt);
  }, [job?.client?.createdAt]);

  const submitProposal = async (values) => {
    setMessage("");

    try {
      setSubmitting(true);
      await axiosInstance.post(`/api/jobs/${id}/apply`, {
        coverLetter: values.coverLetter.trim(),
        proposedRate: values.proposedRate || undefined,
        estimatedTime: values.estimatedTime || undefined,
      });
      setMessage("Proposal submitted successfully.");
      setJob((prev) => ({ ...prev, workerApplicationStatus: "pending" }));
      reset();
      toast.success("Proposal submitted successfully.");
    } catch (error) {
      const apiMessage =
        error?.response?.data?.errors?.[0]?.message || error?.response?.data?.message || "Could not submit proposal.";
      setMessage(apiMessage);
      toast.error(apiMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const acceptApplication = async (appId) => {
    try {
      await axiosInstance.patch(`/api/jobs/${id}/applications/${appId}/accept`);
      const response = await axiosInstance.get(`/api/jobs/${id}/applications`);
      setApplications(response.data || []);
      setJob((prev) => ({ ...prev, status: "in-progress" }));
      toast.success("Application accepted.");
    } catch (error) {
      const apiMessage = error?.response?.data?.message || "Unable to accept application.";
      setMessage(apiMessage);
      toast.error(apiMessage);
    }
  };

  const rejectApplication = async (appId) => {
    try {
      await axiosInstance.patch(`/api/jobs/${id}/applications/${appId}/reject`);
      const response = await axiosInstance.get(`/api/jobs/${id}/applications`);
      setApplications(response.data || []);
      toast.success("Application rejected.");
    } catch (error) {
      const apiMessage = error?.response?.data?.message || "Reject action is currently unavailable.";
      setMessage(apiMessage);
      toast.error(apiMessage);
    }
  };

  if (loading) {
    return (
      <div className="job-detail-page">
        <Navbar />
        <main className="job-detail-main">
          <div className="jd-skeleton" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="job-detail-page">
        <Navbar />
        <main className="job-detail-main">
          <div className="jd-empty">
            <h2>Job not found</h2>
            <Link to="/jobs">Back to Job Board</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="job-detail-page">
      <Navbar />

      <main className="job-detail-main">
        <div className="jd-container">
          <p className="jd-breadcrumb">
            Jobs &gt; {job.category || "General"} &gt; {job.title}
          </p>

          <section className="jd-header-card">
            <div className="jd-header-top">
              <h1>{job.title}</h1>
              <Badge tone={statusTone[job.status] || "gray"}>{job.status}</Badge>
            </div>

            <div className="jd-client-row">
              <img
                src={job.client?.avatar || "https://via.placeholder.com/80?text=C"}
                alt={job.client?.name || "Client"}
              />
              <div>
                <p className="jd-client-name">{job.client?.name || "Unknown Client"}</p>
                <p className="jd-client-date">Joined {joinedDate || "recently"}</p>
              </div>
            </div>

            <div className="jd-meta-grid">
              <div>
                <p className="jd-meta-label">Budget</p>
                <p className="jd-budget">${job.budget ?? 0}</p>
              </div>
              <div>
                <p className="jd-meta-label">Deadline</p>
                <p>{formatDate(job.deadline)}</p>
              </div>
              {job.category !== "digital" && job.location ? (
                <div>
                  <p className="jd-meta-label">Location</p>
                  <p>{job.location}</p>
                </div>
              ) : null}
            </div>
          </section>

          <section className="jd-content-card">
            <h2>Description</h2>
            <p>{job.description}</p>

            <div className="jd-tags">
              {(job.tags || []).map((tag) => (
                <Badge key={tag} tone="green">
                  {tag}
                </Badge>
              ))}
            </div>
          </section>

          {isWorker && job.status === "open" ? (
            alreadyApplied ? (
              <section className="jd-applied-banner">You've already applied</section>
            ) : (
              <section className="jd-proposal-card">
                <h2>Submit a Proposal</h2>
                <form onSubmit={handleSubmit(submitProposal)} className="jd-proposal-form" noValidate>
                  <label>
                    Cover Letter
                    <textarea
                      placeholder="Explain why you're a great fit for this job."
                      {...register("coverLetter", {
                        required: "Cover letter is required",
                        minLength: {
                          value: 50,
                          message: "Cover letter must be at least 50 characters",
                        },
                      })}
                    />
                    {errors.coverLetter ? <span className="jd-field-error">{errors.coverLetter.message}</span> : null}
                  </label>

                  <div className="jd-proposal-grid">
                    <label>
                      Proposed Rate
                      <input
                        type="number"
                        placeholder="e.g. 300"
                        {...register("proposedRate", {
                          min: {
                            value: 1,
                            message: "Rate must be greater than 0",
                          },
                        })}
                      />
                      {errors.proposedRate ? <span className="jd-field-error">{errors.proposedRate.message}</span> : null}
                    </label>

                    <label>
                      Estimated Time
                      <input
                        type="text"
                        placeholder="e.g. 5 days"
                        {...register("estimatedTime", {
                          minLength: {
                            value: 2,
                            message: "Estimated time must be at least 2 characters",
                          },
                        })}
                      />
                      {errors.estimatedTime ? <span className="jd-field-error">{errors.estimatedTime.message}</span> : null}
                    </label>
                  </div>

                  <Button type="submit" variant="primary" loading={submitting}>
                    Submit Proposal
                  </Button>
                </form>
              </section>
            )
          ) : null}

          {isOwner ? (
            <section className="jd-applications-section">
              <h2>Applications</h2>
              {applications.length === 0 ? (
                <p className="jd-muted">No applications yet.</p>
              ) : (
                <div className="jd-application-list">
                  {applications.map((app) => {
                    const isExpanded = Boolean(expanded[app._id]);
                    return (
                      <article key={app._id} className="jd-application-card">
                        <div className="jd-application-head">
                          <div className="jd-application-worker">
                            <img
                              src={app.worker?.avatar || "https://via.placeholder.com/64?text=W"}
                              alt={app.worker?.name || "Worker"}
                            />
                            <div>
                              <p className="jd-worker-name">{app.worker?.name || "Unknown Worker"}</p>
                              <StarRating rating={app.worker?.rating || 0} size={14} />
                            </div>
                          </div>

                          <Badge tone={app.status === "accepted" ? "green" : app.status === "rejected" ? "gray" : "yellow"}>
                            {app.status}
                          </Badge>
                        </div>

                        <div className="jd-application-meta">
                          <p>Proposed Rate: ${app.proposedRate ?? 0}</p>
                          <p>Estimated Time: {app.estimatedTime || "N/A"}</p>
                        </div>

                        <button
                          type="button"
                          className="jd-cover-toggle"
                          onClick={() =>
                            setExpanded((prev) => ({
                              ...prev,
                              [app._id]: !prev[app._id],
                            }))
                          }
                        >
                          {isExpanded ? "Hide" : "Show"} Cover Letter
                        </button>

                        {isExpanded ? <p className="jd-cover-letter">{app.coverLetter}</p> : null}

                        <div className="jd-application-actions">
                          <Button variant="primary" onClick={() => acceptApplication(app._id)}>
                            Accept
                          </Button>
                          <button
                            type="button"
                            className="jd-reject-btn"
                            onClick={() => rejectApplication(app._id)}
                          >
                            Reject
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          ) : null}

          {message ? <p className="jd-message">{message}</p> : null}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default JobDetail;
