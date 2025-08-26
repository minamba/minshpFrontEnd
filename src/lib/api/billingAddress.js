import axios from "axios";

export const getBillingAddresses = () => {
    return axios.get("/billingAddresses");
}

export const addBillingAddress = (billingAddress) => {
    return axios.post("/billingAddress", billingAddress);
}

export const updateBillingAddress = (billingAddress) => {
    return axios.put("/billingAddress", billingAddress);
}

export const deleteBillingAddress = (id) => {
    return axios.delete(`/billingAddress/${id}`);
}
