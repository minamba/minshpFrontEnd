import axios from "axios";

export const createCheckoutSession = (payload) => {
    return axios.post("/payments/checkout-session", payload);
  };
  

  export const confirmCheckout = (sessionId) => {
    return axios.get("/payments/confirm", {
      params: { session_id: sessionId },
    });
  };