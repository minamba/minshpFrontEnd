import axios from "axios";


const API_HOST = window.location.hostname;     // ex: "localhost" ou "192.168.1.63"
const API_PORT = 5098;
//const baseurl = `http://${API_HOST}:${API_PORT}`;
const baseurl = "https://minshp.com";                              // ton port API HTTP


const idp = axios.create({ 
  baseURL: baseurl,
   // header pas obligatoire ici, Axios le mettra pour URLSearchParams
   headers: { "Accept": "application/json" }, 
   timeout: 10000
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
  return axios.post("/account/register", dto, {
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
  return axios.put(`/account/${encodeURIComponent(data.Id)}`, data, {
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    withCredentials: false,
  });
}


export function deleteUser(id) {
  return axios.delete(`/account/${encodeURIComponent(id)}`, {
    headers: {
      ...authHeader(),        // Bearer <token>
    },
    withCredentials: false,   // SPA: pas de cookies nécessaires
  });
}

export function updateUserPassword(data) {
  return axios.put(`/account/${encodeURIComponent(data.Id)}/password`, data, {
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    withCredentials: false,
  });
}




//role

export function addUserRole(data) {
    return axios.post(`/role/add`, data, {
      headers: {
        "Content-Type": "application/json",
        ...authHeader(),
      },
      withCredentials: false,
    });
  }

  export function removeUserRole(data) {
    return axios.post(`/role/remove`, data, {
      headers: {
        "Content-Type": "application/json",
        ...authHeader(),        // Bearer <token>
      },
      withCredentials: false,   // SPA: pas de cookies nécessaires
    });
  }



  //Lock Use

  export function lockUser(id) {
    return axios.post(`/account/${encodeURIComponent(id)}/lock`,null, {
      headers: {
        ...authHeader(),
        withCredentials: false,        // Bearer <token>
      },
      withCredentials: false,   // SPA: pas de cookies nécessaires
    });
  }


  // Unlock User

  export function unlockUser(id) {
    return axios.post(`/account/${encodeURIComponent(id)}/unlock`,null, {
      headers: {
        ...authHeader(),        // Bearer <token>
      },
      withCredentials: false,   // SPA: pas de cookies nécessaires
    });
  }

