// src/routes/RequireRole.jsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getUserRoles } from "../../../lib/utils/jwt";

export default function RequireRole({ allowed = ["Admin"] }) {
  const token = localStorage.getItem("access_token");
  const raw = getUserRoles(token);
  const roles = Array.isArray(raw) ? raw : raw ? [raw] : [];

  const hasRole = allowed.some(need =>
    roles.map(r => String(r).toLowerCase()).includes(String(need).toLowerCase())
  );

  const isLogged = !!token; // adapte selon ton store (ex: account.isAuth)
  const location = useLocation();

  if (!isLogged) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (!hasRole) {
    return <Navigate to="/Notfound" replace state={{ from: location }} />; // ou "/"
  }

  return <Outlet />;
}
