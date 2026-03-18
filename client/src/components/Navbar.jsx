import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "./Button";
import "./components.css";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/jobs", label: "Jobs" },
];

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setDrawerOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const roleAction = useMemo(() => {
    if (!user) return null;
    if (user.role === "client") return { label: "Post Job", to: "/post-job" };
    if (user.role === "worker") return { label: "My Services", to: "/dashboard" };
    return { label: "Admin", to: "/admin" };
  }, [user]);

  return (
    <header className="sh-navbar">
      <div className="sh-navbar-inner">
        <Link to="/" className="sh-logo">
          ServiceHire
        </Link>

        <nav className="sh-nav-links" aria-label="Main navigation">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className="sh-nav-link">
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="sh-nav-actions sh-nav-actions-desktop">
          {!user ? (
            <>
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Signup
                </Button>
              </Link>
            </>
          ) : (
            <>
              <button
                type="button"
                className="sh-avatar-btn"
                onClick={() => setDropdownOpen((prev) => !prev)}
              >
                {getInitials(user.name)}
              </button>

              {dropdownOpen ? (
                <div className="sh-dropdown">
                  <Link to="/dashboard">Dashboard</Link>
                  <Link to="/messages">Messages</Link>
                  {roleAction ? <Link to={roleAction.to}>{roleAction.label}</Link> : null}
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                    }}
                  >
                    Logout
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>

        <button
          type="button"
          className="sh-mobile-toggle"
          onClick={() => setDrawerOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </div>

      <div className={`sh-mobile-drawer ${drawerOpen ? "open" : ""}`.trim()}>
        <div className="sh-mobile-content">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className="sh-nav-link">
              {link.label}
            </NavLink>
          ))}

          {!user ? (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Signup</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/messages">Messages</Link>
              {roleAction ? <Link to={roleAction.to}>{roleAction.label}</Link> : null}
              <button type="button" onClick={logout}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
