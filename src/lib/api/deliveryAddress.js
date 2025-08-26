import axios from "axios";

export const getDeliveryAddresses = () => {
    return axios.get("/deliveryAddresses");
}

export const addDeliveryAddress = (deliveryAddress) => {
    return axios.post("/deliveryAddress", deliveryAddress);
}

export const updateDeliveryAddress = (deliveryAddress) => {
    return axios.put("/deliveryAddress", deliveryAddress);
}

export const deleteDeliveryAddress = (id) => {
    return axios.delete(`/deliveryAddress/${id}`);
}
