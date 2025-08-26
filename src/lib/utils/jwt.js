// src/lib/utils/jwt.js
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
  