import React from "react";
import { Link } from "react-router-dom";
import "../../../App.css";

export const Notfound = () => {
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
      <h1 style={{ fontSize: "6rem", fontWeight: "bold", color: "#ef4444" }}>
        404
      </h1>
      <h2 style={{ fontSize: "1.8rem", marginBottom: "10px" }}>
        Page introuvable
      </h2>
      <img style={{ width: "400px", marginBottom: "20px" }} src="../images/notFound_avatar.png" alt="" />
      <p style={{ maxWidth: "500px", color: "#6b7280", marginBottom: "20px" }}>
        Oups ! La page que vous recherchez n’existe pas ou a été déplacée.
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
    </div>
  );
};
