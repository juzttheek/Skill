import { useEffect, useMemo, useState } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Badge from "../components/Badge";
import Button from "../components/Button";
import Footer from "../components/Footer";
import Modal from "../components/Modal";
import Navbar from "../components/Navbar";
import ReviewCard from "../components/ReviewCard";
import ServiceCard from "../components/ServiceCard";
import StarRating from "../components/StarRating";
import { useAuth } from "../context/AuthContext";
import "./WorkerProfile.css";

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString();
};

const WorkerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewPage, setReviewPage] = useState(1);
  const [portfolioItem, setPortfolioItem] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/users/${id}/profile`);
        const raw = response.data?.profile || response.data || {};
        const profileUser = raw.user && typeof raw.user === "object" ? raw.user : { _id: raw.user || id };

        const normalized = {
          ...raw,
          user: profileUser,
          name: raw.name || profileUser.name || "Worker",
          avatar: profileUser.avatar || raw.avatar || "",
          location: raw.location || "Location not specified",
          bio: raw.bio || "No bio provided yet.",
          availability: raw.availability !== false,
          completedJobs: raw.completedJobs || 0,
          avgResponseTime: raw.avgResponseTime || "2 hours",
          onTimeRate: raw.onTimeRate || "96%",
          languages: raw.languages || [],
          categories: raw.categories || [],
          skills: raw.skills || [],
          hourlyRate: raw.hourlyRate || 0,
          portfolio: raw.portfolio || [],
          rating: raw.rating || 0,
          totalReviews: raw.totalReviews || 0,
          createdAt: profileUser.createdAt || raw.createdAt,
        };

        setProfile(normalized);

        const [servicesRes, reviewsRes] = await Promise.all([
          axiosInstance.get("/api/services?limit=100"),
          axiosInstance.get(`/api/reviews/user/${normalized.user._id}`),
        ]);

        const allServices = servicesRes.data?.data || [];
        const workerServices = allServices.filter(
          (service) => (service.worker?._id || service.worker) === normalized.user._id
        );

        setServices(workerServices);
        setReviews(reviewsRes.data || []);
      } catch (error) {
        setProfile(null);
        setServices([]);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const currentUserId = user?.id || user?._id;
  const isOwner = currentUserId && profile?.user?._id && currentUserId === profile.user._id;

  const tagline = (profile?.bio || "").split("\n")[0] || "Skilled professional";

  const reviewAverage = useMemo(() => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((acc, review) => acc + (Number(review.rating) || 0), 0);
    return Number((sum / reviews.length).toFixed(1));
  }, [reviews]);

  const ratingBreakdown = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      const key = Math.round(Number(review.rating) || 0);
      if (counts[key] !== undefined) counts[key] += 1;
    });
    return counts;
  }, [reviews]);

  const reviewsPerPage = 5;
  const totalReviewPages = Math.max(Math.ceil(reviews.length / reviewsPerPage), 1);
  const pagedReviews = useMemo(() => {
    const start = (reviewPage - 1) * reviewsPerPage;
    return reviews.slice(start, start + reviewsPerPage);
  }, [reviews, reviewPage]);

  if (loading) {
    return (
      <div className="worker-profile-page">
        <Navbar />
        <main className="worker-profile-main">
          <div className="wp-skeleton" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="worker-profile-page">
        <Navbar />
        <main className="worker-profile-main">
          <div className="wp-empty">
            <h2>Profile not found</h2>
            <Link to="/services">Browse services</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="worker-profile-page">
      <Navbar />

      <main className="worker-profile-main">
        <div className="wp-shell">
          <section className="wp-header-card">
            {isOwner ? (
              <div className="wp-edit-top">
                <Button variant="outline" onClick={() => navigate("/dashboard")}>
                  Edit Profile
                </Button>
              </div>
            ) : null}

            <div className="wp-header-grid">
              <div className="wp-avatar-wrap">
                <img
                  src={profile.avatar || "https://via.placeholder.com/140?text=W"}
                  alt={profile.name}
                  className="wp-avatar"
                />
                <span className={`wp-availability-dot ${profile.availability ? "available" : "offline"}`.trim()} />
              </div>

              <div className="wp-main-meta">
                <h1>{profile.name}</h1>
                <p className="wp-tagline">{tagline}</p>
                <p className="wp-muted-line">
                  <FaMapMarkerAlt /> {profile.location}
                </p>
                <p className="wp-muted-line">Member since {formatDate(profile.createdAt) || "recently"}</p>
              </div>

              <div className="wp-header-actions">
                <div>
                  <StarRating rating={profile.rating || reviewAverage} size={16} />
                  <p className="wp-small-muted">{profile.totalReviews || reviews.length} reviews</p>
                </div>

                <Button variant="primary" onClick={() => navigate(`/messages/${profile.user._id}`)}>
                  Contact
                </Button>
                <Button variant="outline">Save Profile</Button>
              </div>
            </div>

            <div className="wp-chip-row">
              {profile.skills.map((skill) => (
                <Badge key={skill} tone="green">
                  {skill}
                </Badge>
              ))}
            </div>
            <div className="wp-chip-row">
              {profile.languages.map((language) => (
                <Badge key={language} tone="gray">
                  {language}
                </Badge>
              ))}
            </div>
          </section>

          <section className="wp-stats-row">
            <article className="wp-stat-box">
              <p className="wp-stat-value">{profile.completedJobs}</p>
              <p className="wp-stat-label">Jobs Completed</p>
            </article>
            <article className="wp-stat-box">
              <p className="wp-stat-value">{profile.avgResponseTime}</p>
              <p className="wp-stat-label">Avg. Response Time</p>
            </article>
            <article className="wp-stat-box">
              <p className="wp-stat-value">{profile.onTimeRate}</p>
              <p className="wp-stat-label">On-time Rate</p>
            </article>
          </section>

          <section className="wp-panel">
            <h2>About {profile.name}</h2>
            <p className="wp-about-text">{profile.bio}</p>
            <div className="wp-chip-row">
              {profile.categories.map((category) => (
                <Badge key={category} tone="green">
                  {category}
                </Badge>
              ))}
            </div>
            <p className="wp-hourly-rate">${profile.hourlyRate} / hr</p>
          </section>

          <section className="wp-panel">
            <h2>Services Offered ({services.length})</h2>
            <div className="wp-services-row">
              {services.map((service) => (
                <div key={service._id} className="wp-service-item">
                  <ServiceCard service={service} />
                </div>
              ))}
            </div>
          </section>

          {profile.portfolio?.length ? (
            <section className="wp-panel">
              <h2>Portfolio</h2>
              <div className="wp-portfolio-grid">
                {profile.portfolio.map((item, index) => (
                  <button
                    key={`${item.title}-${index}`}
                    type="button"
                    className="wp-portfolio-card"
                    onClick={() => setPortfolioItem(item)}
                  >
                    <img src={item.imageUrl || "https://via.placeholder.com/600x360?text=Portfolio"} alt={item.title || "Portfolio"} />
                    <div>
                      <p className="wp-item-title">{item.title || "Untitled"}</p>
                      <p className="wp-item-desc">{item.description || ""}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          <section className="wp-panel">
            <h2>Reviews</h2>

            <div className="wp-reviews-summary">
              <div className="wp-average-box">
                <div className="wp-big-star">★</div>
                <p className="wp-average-number">{reviewAverage.toFixed(1)} out of 5</p>
                <p className="wp-small-muted">Based on {reviews.length} reviews</p>
              </div>

              <div className="wp-breakdown">
                {[5, 4, 3, 2, 1].map((score) => {
                  const count = ratingBreakdown[score];
                  const width = reviews.length ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={score} className="wp-breakdown-row">
                      <span>{score}★</span>
                      <div className="wp-break-bar">
                        <div style={{ width: `${width}%` }} />
                      </div>
                      <span>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="wp-review-list">
              {pagedReviews.map((review) => (
                <ReviewCard key={review._id} review={review} />
              ))}
            </div>

            {totalReviewPages > 1 ? (
              <div className="wp-pagination">
                <button
                  type="button"
                  onClick={() => setReviewPage((page) => Math.max(1, page - 1))}
                  disabled={reviewPage === 1}
                >
                  Prev
                </button>
                {Array.from({ length: totalReviewPages }, (_, index) => index + 1).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    className={reviewPage === pageNumber ? "active" : ""}
                    onClick={() => setReviewPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setReviewPage((page) => Math.min(totalReviewPages, page + 1))}
                  disabled={reviewPage === totalReviewPages}
                >
                  Next
                </button>
              </div>
            ) : null}
          </section>
        </div>
      </main>

      <Modal open={Boolean(portfolioItem)} title={portfolioItem?.title || "Portfolio"} onClose={() => setPortfolioItem(null)}>
        <div className="wp-portfolio-modal">
          <img src={portfolioItem?.imageUrl || "https://via.placeholder.com/900x520?text=Portfolio"} alt={portfolioItem?.title || "Portfolio"} />
          <p>{portfolioItem?.description}</p>
        </div>
      </Modal>

      <Footer />
    </div>
  );
};

export default WorkerProfile;
