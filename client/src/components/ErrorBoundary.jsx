import { Component } from "react";
import { Link } from "react-router-dom";
import "./ErrorBoundary.css";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("Unhandled UI error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="sh-error-fallback" role="alert">
          <div className="sh-error-card">
            <p className="sh-error-kicker">Something went wrong</p>
            <h1>We hit an unexpected issue.</h1>
            <p>Please refresh the page. If the issue continues, go back home and try again.</p>
            <div className="sh-error-actions">
              <button type="button" onClick={() => window.location.reload()}>
                Refresh
              </button>
              <Link to="/">Back Home</Link>
            </div>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
