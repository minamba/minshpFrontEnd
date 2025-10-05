import axios from "axios";


//login
export const login = ({ email, password }) => {
  const body = new URLSearchParams({
    grant_type: "password",
    username: email,
    password: password,
    client_id: "react-spa",
    scope: "openid profile roles api", // ✅ sans doublon
  });

  return axios.post("/api/auth/token", body, {
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

  return axios.post("/api/auth/token", body, {
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

