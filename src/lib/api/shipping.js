import axios from "axios";

// export const getRates = (params) =>
//   axios.get("/shippings/rates", {params}); // { toZip, country, weightKg, valuee} 

export const getRates = (params) =>
  axios.post("/Shippings/rates", params);


export const getRelays = (params) =>
  axios.get("/shippings/relays", { params }); // { zip, country, limit? }

export const createShipment = (shipment) =>
  axios.post("/shippings/create-shipment", shipment);

export const getRelaysByAddress = (params) =>
  axios.get("/shippings/relays/by-address", { params }); // { zip, country, limit? }

export const getContentCategory = (params) =>
  axios.get("/shippings/contentCodes", { params }); // { zip, country, limit? }
