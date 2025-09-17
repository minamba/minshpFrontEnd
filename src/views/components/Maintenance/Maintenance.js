import React from "react";
import { Link } from "react-router-dom";
import "../../../App.css";

export const Maintenance = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        background: "linear-gradient(135deg, #f9fafb, #e5e7eb)",
        color: "#111827",
        padding: "20px",
      }}
    >
        <img style={{ width: "400px", marginBottom: "10px" }} src="../images/maintenance.png" alt="" />
      {/* <div
        style={{
          fontSize: "5rem",
          marginBottom: "20px",
          color: "#f59e0b",
          animation: "spin 3s linear infinite",
        }}
      >
        ⚙️
      </div> */}
      <h1 style={{ fontSize: "2rem", marginBottom: "10px" }}>
        Site en maintenance
      </h1>
      <p style={{ maxWidth: "500px", color: "#6b7280", marginBottom: "20px" }}>
        Nous effectuons actuellement une mise à jour afin d’améliorer votre
        expérience. Merci de votre patience, le site sera de retour très vite 🚀
      </p>
      <Link
        to="/"
        style={{
          padding: "12px 24px",
          backgroundColor: "#3b82f6",
          color: "#fff",
          borderRadius: "8px",
          textDecoration: "none",
          fontWeight: "500",
          transition: "background 0.3s",
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#2563eb")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "#3b82f6")}
      >
        ⬅ Retour à l’accueil
      </Link>

      {/* petite animation CSS */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};
