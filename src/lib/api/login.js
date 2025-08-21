import axios from "axios";

// client vers IdentityServer, pas notre API
const idp = axios.create({
    baseURL: "https://localhost:7183",
    headers: { "Content-Type": "application/x-www-form-urlencoded" }
  });

  export const login = ({email, password, remember, navigate}) => {
    return idp.post("/connect/token", new URLSearchParams({
      grant_type: "password",
      username: email,
      password: password,
      client_id: "react-spa",
      scope: "openid profile api",
    }));
  };