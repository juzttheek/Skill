import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Button from "../components/Button";
import Footer from "../components/Footer";
import JobCard from "../components/JobCard";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import "./JobBoard.css";

const CATEGORY_OPTIONS = [
  { value: "digital", label: "Digital" },
  { value: "local", label: "Local" },
  { value: "professional", label: "Professional" },
];

const POSTED_WITHIN_OPTIONS = [
  { value: "any", label: "Any" },
  { value: "24h", label: "Last 24h" },
  { value: "7d", label: "Last 7d" },
  { value: "30d", label: "Last 30d" },
];

const JobBoard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [searchInput, setSearchInput] = useState(params.get("search") || "");
  const [categories, setCategories] = useState(
    params.get("category") ? params.get("category").split(",") : []
  );
  const [minBudget, setMinBudget] = useState(params.get("minBudget") || "");
  const [maxBudget, setMaxBudget] = useState(params.get("maxBudget") || "");
  const [budgetType, setBudgetType] = useState(params.get("budgetType") || "any");
  const [postedWithin, setPostedWithin] = useState(params.get("postedWithin") || "any");
  const [sortBy, setSortBy] = useState(params.get("sort") || "newest");

  useEffect(() => {
    const query = new URLSearchParams();
    if (searchInput.trim()) query.set("search", searchInput.trim());
    if (categories.length > 0) query.set("category", categories.join(","));
    if (minBudget) query.set("minBudget", minBudget);
    if (maxBudget) query.set("maxBudget", maxBudget);
    if (budgetType !== "any") query.set("budgetType", budgetType);
    if (postedWithin !== "any") query.set("postedWithin", postedWithin);
    if (sortBy !== "newest") query.set("sort", sortBy);
    setParams(query, { replace: true });
  }, [searchInput, categories, minBudget, maxBudget, budgetType, postedWithin, sortBy, setParams]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const query = new URLSearchParams();
        query.set("status", "open");
        query.set("limit", "40");
        if (searchInput.trim()) query.set("search", searchInput.trim());
        if (categories.length > 0) query.set("category", categories.join(","));
        if (minBudget) query.set("minBudget", minBudget);
        if (maxBudget) query.set("maxBudget", maxBudget);
        if (budgetType !== "any") query.set("budgetType", budgetType);

        const response = await axiosInstance.get(`/api/jobs?${query.toString()}`);
        setJobs(response.data?.data || []);
        setTotalCount(response.data?.totalCount || 0);
      } catch (error) {
        setJobs([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [searchInput, categories, minBudget, maxBudget, budgetType]);

  const list = useMemo(() => {
    let items = [...jobs];

    if (postedWithin !== "any") {
      const now = Date.now();
      const cutoffMap = {
        "24h": now - 24 * 60 * 60 * 1000,
        "7d": now - 7 * 24 * 60 * 60 * 1000,
        "30d": now - 30 * 24 * 60 * 60 * 1000,
      };
      const cutoff = cutoffMap[postedWithin];
      if (cutoff) {
        items = items.filter((job) => new Date(job.createdAt || 0).getTime() >= cutoff);
      }
    }

    if (sortBy === "budget-high-low") {
      items.sort((a, b) => (b.budget || 0) - (a.budget || 0));
    } else if (sortBy === "budget-low-high") {
      items.sort((a, b) => (a.budget || 0) - (b.budget || 0));
    } else {
      items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return items;
  }, [jobs, postedWithin, sortBy]);

  const toggleCategory = (value) => {
    setCategories((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const clearFilters = () => {
    setCategories([]);
    setMinBudget("");
    setMaxBudget("");
    setBudgetType("any");
    setPostedWithin("any");
    setSearchInput("");
    setSortBy("newest");
  };

  const filterPanel = (
    <div className="jb-filters-panel">
      <div className="jb-filter-group">
        <p className="jb-filter-title">Category</p>
        {CATEGORY_OPTIONS.map((item) => (
          <label key={item.value} className="jb-check-row">
            <input
              type="checkbox"
              checked={categories.includes(item.value)}
              onChange={() => toggleCategory(item.value)}
            />
            <span>{item.label}</span>
          </label>
        ))}
      </div>

      <div className="jb-filter-group">
        <p className="jb-filter-title">Budget Range</p>
        <div className="jb-budget-grid">
          <input
            type="number"
            placeholder="Min"
            value={minBudget}
            onChange={(event) => setMinBudget(event.target.value)}
          />
          <input
            type="number"
            placeholder="Max"
            value={maxBudget}
            onChange={(event) => setMaxBudget(event.target.value)}
          />
        </div>
      </div>

      <div className="jb-filter-group">
        <p className="jb-filter-title">Budget Type</p>
        {["any", "fixed", "hourly"].map((value) => (
          <label key={value} className="jb-check-row">
            <input
              type="radio"
              name="budgetType"
              checked={budgetType === value}
              onChange={() => setBudgetType(value)}
            />
            <span>{value === "any" ? "Any" : value[0].toUpperCase() + value.slice(1)}</span>
          </label>
        ))}
      </div>

      <div className="jb-filter-group">
        <p className="jb-filter-title">Posted Within</p>
        <select value={postedWithin} onChange={(event) => setPostedWithin(event.target.value)}>
          {POSTED_WITHIN_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <button type="button" className="jb-clear-link" onClick={clearFilters}>
        Clear Filters
      </button>

      <Button variant="primary" className="jb-apply-btn" onClick={() => setDrawerOpen(false)}>
        Apply Filters
      </Button>
    </div>
  );

  return (
    <div className="job-board-page">
      <Navbar />
      <main className="job-board-main">
        <div className="jb-layout">
          <aside className="jb-sidebar">{filterPanel}</aside>

          <section className="jb-results">
            <div className="jb-topbar">
              <input
                type="text"
                placeholder="Search job posts"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="newest">Newest</option>
                <option value="budget-high-low">Budget High-Low</option>
                <option value="budget-low-high">Budget Low-High</option>
              </select>
              <button type="button" className="jb-mobile-filter-btn" onClick={() => setDrawerOpen(true)}>
                Filter
              </button>
            </div>

            {!user ? (
              <div className="jb-worker-banner">
                <p>Sign up as a worker to apply for jobs</p>
                <Link to="/register">
                  <button type="button" className="jb-register-btn">
                    Register
                  </button>
                </Link>
              </div>
            ) : null}

            <p className="jb-results-count">{totalCount} open jobs found</p>

            {loading ? (
              <div className="jb-list">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={`job-skeleton-${index}`} className="jb-card-skeleton" />
                ))}
              </div>
            ) : list.length === 0 ? (
              <div className="jb-empty">
                <div className="jb-empty-illustration">🧭</div>
                <h2>No jobs found</h2>
                <p>Try adjusting filters or checking back soon for new opportunities.</p>
              </div>
            ) : (
              <div className="jb-list">
                {list.map((job) => (
                  <JobCard
                    key={job._id}
                    job={job}
                    variant="list"
                    buttonLabel="Apply Now"
                    onViewApply={() => navigate(`/jobs/${job._id}`)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <div className={`jb-drawer-backdrop ${drawerOpen ? "open" : ""}`.trim()}>
        <div className="jb-drawer">
          <div className="jb-drawer-head">
            <h3>Filters</h3>
            <button type="button" onClick={() => setDrawerOpen(false)}>
              Close
            </button>
          </div>
          {filterPanel}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default JobBoard;
