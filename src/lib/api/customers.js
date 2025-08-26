import axios from "axios";

export const getCustomers = () => {
    return axios.get("/customers");
}

export const addCustomer = (customer) => {
    return axios.post("/customer", customer);
}

export const updateCustomer = (customer) => {
    return axios.put("/customer", customer);
}

export const deleteCustomer = (id) => {
    return axios.delete(`/customer/${id}`);
}
