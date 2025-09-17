// src/lib/utils/jwt.js
import { jwtDecode } from "jwt-decode";

export function decodeJwt(token) {
    try {
      const payload = token.split(".")[1];
      const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
      return JSON.parse(decodeURIComponent(escape(json)));
    } catch {
      return null;
    }
  }
  
  export const toArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);


  export const getUserRoles = (token) => {
    if (!token) return [];
    const decoded = jwtDecode(token);
    // selon comment IdentityServer envoie les rôles
    return decoded.role
      ? Array.isArray(decoded.role) 
        ? decoded.role 
        : [decoded.role]
      : [];
  };
