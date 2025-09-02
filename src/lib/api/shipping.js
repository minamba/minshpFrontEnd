import axios from "axios";

export const getRates = (params) =>
  axios.get("/shippings/rates", { params }); // { toZip, country, weightKg, value }

export const getRelays = (params) =>
  axios.get("/shippings/relays", { params }); // { zip, country, limit? }

export const createShipment = (orderId, body) =>
  axios.post("/shippings/create-shipment", body, { params: { orderId } });

export const getRelaysByAddress = (params) =>
  axios.get("/shippings/relays/by-address", { params }); // { zip, country, limit? }
