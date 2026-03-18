import { Link } from "react-router-dom";
import "./components.css";

const Footer = () => {
  return (
    <footer className="sh-footer">
      <div className="sh-footer-grid">
        <div>
          <p className="sh-footer-title">ServiceHire</p>
          <p>Hire trusted workers or get hired for the services you do best.</p>
        </div>

        <div>
          <p className="sh-footer-title">Quick Links</p>
          <p>
            <Link to="/services">Services</Link>
          </p>
          <p>
            <Link to="/jobs">Jobs</Link>
          </p>
          <p>
            <Link to="/dashboard">Dashboard</Link>
          </p>
        </div>

        <div>
          <p className="sh-footer-title">Contact</p>
          <p>Email: hello@servicehire.app</p>
          <p>Phone: +1 (555) 010-2030</p>
          <p>Address: Remote First, Worldwide</p>
        </div>
      </div>

      <div className="sh-footer-bottom">© 2025 ServiceHire</div>
    </footer>
  );
};

export default Footer;
