import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../lib/actions/AccountActions";

// lit le token dans une liste de clés possibles
const readToken = (keys) => {
  for (const k of keys) {
    const v = localStorage.getItem(k) || sessionStorage.getItem(k);
    if (v) return v;
  }
  return null;
};

// si JWT -> renvoie exp en ms ; sinon null
const getJwtExpMs = (token) => {
  try {
    const [, payload] = token.split(".");
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof json.exp === "number" ? json.exp * 1000 : null;
  } catch {
    return null;
  }
};

export default function useAuthSync({
  pollMs = 30000,
  tokenKeys = ["access_token"],   // 👈 par défaut sur ta clé
  expiresAtKey = "expires_at",    // optionnel si tu stockes l’expiration côté client
} = {}) {
  const dispatch = useDispatch();
  const isAuth = useSelector((s) => !!s?.account?.isAuth);

  useEffect(() => {
    const check = () => {
      const token = readToken(tokenKeys);

      // 1) plus de token -> déconnexion
      if (!token) {
        if (isAuth) dispatch(logout());
        return;
      }

      // 2) expiration “client” (si tu stockes un timestamp)
      const expStr = localStorage.getItem(expiresAtKey);
      const expNum = expStr ? Number(expStr) : 0;
      if (expNum && Date.now() >= expNum) {
        dispatch(logout());
        return;
      }

      // 3) expiration JWT (si c’est un JWT)
      const expMs = getJwtExpMs(token);
      if (expMs && Date.now() >= expMs) {
        dispatch(logout());
      }
    };

    check(); // au mount

    const id = setInterval(check, pollMs);

    const onFocus = () => check();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);

    // si la clé du token change (même autre onglet), on re-vérifie
    const onStorage = (e) => {
      if (!e.key) return;
      if (tokenKeys.includes(e.key) || e.key === expiresAtKey) check();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("storage", onStorage);
    };
  }, [dispatch, isAuth, pollMs, tokenKeys, expiresAtKey]);
}
