import axios from "axios";

export const getCustomerRates = () => {
    return axios.get("/customerRates");
}

export const addCustomerRate = (customerRate) => {
    return axios.post("/customerRate", customerRate);
}

export const updateCustomerRate = (customerRate) => {
    return axios.put("/customerRate", customerRate);
}

export const deleteCustomerRate = (id) => {
    return axios.delete(`/customerRate/${id}`);
}
