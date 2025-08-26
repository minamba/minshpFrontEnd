import axios from "axios";

const idp = axios.create({
  baseURL: "https://localhost:7183",
  // header pas obligatoire ici, Axios le mettra pour URLSearchParams
  headers: { "Accept": "application/json" },
  timeout: 10000,
});

//login
export const login = ({ email, password }) => {
  const body = new URLSearchParams({
    grant_type: "password",
    username: email,
    password: password,
    client_id: "react-spa",
    scope: "openid profile roles api", // ✅ sans doublon
  });

  return idp.post("/connect/token", body, {
    withCredentials: false, // ✅ SPA: pas de cookies
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
};

//register
export const register = (dto) => {
  return idp.post("/account/register", dto, {
    headers: { "Content-Type": "application/json" },
    withCredentials: false,
  });
};

// (optionnel) login après register
export const passwordToken = ({ email, password }) => {
  const body = new URLSearchParams({
    grant_type: "password",
    username: email,
    password: password,
    client_id: "react-spa",
    scope: "openid profile roles api",
  });

  return idp.post("/connect/token", body, {
    withCredentials: false,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
};



function authHeader() {
  const t = localStorage.getItem("access_token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}


export function updateUser(data) {
  return idp.put(`/account/${encodeURIComponent(data.Id)}`, data, {
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    withCredentials: false,
  });
}


export function deleteUser(id) {
  return idp.delete(`/account/${encodeURIComponent(id)}`, {
    headers: {
      ...authHeader(),        // Bearer <token>
    },
    withCredentials: false,   // SPA: pas de cookies nécessaires
  });
}

export function updateUserPassword(data) {
  return idp.put(`/account/${encodeURIComponent(data.Id)}/password`, data, {
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    withCredentials: false,
  });
}

