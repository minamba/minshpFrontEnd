// src/router/RequireAuth.jsx
import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

function isTokenValid() {
  const t = localStorage.getItem("access_token");
  if (!t) return false;
  try {
    const payload = JSON.parse(atob(t.split(".")[1])); // extraction et decodage du payload afin d'extreaire les claims du token
    const now = Math.floor(Date.now() / 1000);
    return payload.exp ? payload.exp > now : true; // tolérant si pas d'exp (exp = expiration)
  } catch {
    return false;
  }
}

export default function RequireAuth({ children }) { // children = le composant à protéger
  const isAuthState = useSelector((s) => s.login?.isAuth); // adapte la clé si besoin
  const ok = isAuthState || isTokenValid();
  const location = useLocation();

  return ok ? children : <Navigate to="/login" replace state={{ from: location }} />;
}
