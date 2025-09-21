// src/pages/Authentication/MaintenanceGate.jsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

function getUserRoles(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const raw = payload["role"] || payload["roles"] || [];
    return Array.isArray(raw) ? raw : [raw];
  } catch { return []; }
}

export default function MaintenanceGate() {
  const location = useLocation();

  // 1) Récupère le flag maintenance depuis le store (adapte la ligne selon ton reducer)
  const applications = useSelector((s) => s?.applications?.applications ?? []);
  const isMaintenance = applications[0]?.isMaintenance;

  // 2) Détermine si l'utilisateur est admin
  const token = localStorage.getItem("access_token");
  const isAdmin = (getUserRoles(token) || [])
    .map((r) => String(r).toLowerCase())
    .includes("admin");

  // 3) Si maintenance ON et pas admin -> redirige vers /maintenance
  if (isMaintenance && !isAdmin) {
    // si on est déjà sur /maintenance on laisse passer
    if (location.pathname !== "/maintenance") {
      return <Navigate to="/maintenance" replace state={{ from: location }} />;
    }
  }

  // Sinon on affiche la route enfant
  return <Outlet />;
}
