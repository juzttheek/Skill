import { Link } from "react-router-dom";
import Button from "../components/Button";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import "./NotFound.css";

const NotFound = () => {
  return (
    <div className="not-found-page">
      <Navbar />

      <main className="not-found-main">
        <section className="not-found-card">
          <p className="not-found-code">404</p>
          <h1>This page wandered off.</h1>
          <p>
            The link may be outdated, or the page may have moved. Head back to the home page and continue from
            there.
          </p>
          <Link to="/">
            <Button variant="primary">Back to Home</Button>
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
