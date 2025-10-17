// src/utils/mediaUrl.js

// Host courant (localhost sur PC, IP sur mobile, domaine en prod)
const API_HOST = window.location.hostname;
const API_PORT = 5054; // ton port API
//const API_BASE = `http://${API_HOST}:${API_PORT}`;
const API_BASE = "https://minshp.com";

/**
 * Convertit un chemin relatif (images/xxx.jpg, videos/yyy.mp4)
 * en URL absolue accessible depuis le front.
 * 
 * - Si c'est déjà une URL absolue (http...), on la renvoie telle quelle.
 * - Sinon, on la préfixe par l'API_BASE.
 */
export function toMediaUrl(path) {
  if (!path) return null;

  // si déjà absolu, ne touche pas
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // sinon construit l'URL
  return `${API_BASE}/${path.replace(/^\/+/, "")}`;
}