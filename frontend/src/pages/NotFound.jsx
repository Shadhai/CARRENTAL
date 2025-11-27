import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./NotFound.css";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <main className="nf-root">
      <div className="nf-card">
        <div className="nf-illustration" aria-hidden="true">
          <svg viewBox="0 0 120 120" role="img" aria-label="404 decorative">
            <circle cx="60" cy="60" r="50" className="nf-circle" />
            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="nf-text">404</text>
          </svg>
        </div>

        <div className="nf-content">
          <h1>Page not found</h1>
          <p>
            We can't find the page you're looking for. It may have been moved or
            deleted.
          </p>

          <div className="nf-actions">
            <button onClick={() => navigate(-1)} className="btn btn-outline">Go back</button>
            <Link to="/" className="btn btn-primary">Home</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
