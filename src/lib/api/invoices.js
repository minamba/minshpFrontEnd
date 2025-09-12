import axios from "axios";

export const getInvoices = () => {
    return axios.get("/invoices");
}

export const addInvoice = (invoice) => {
    return axios.post("/invoice", invoice);
}

export const updateInvoice = (invoice) => {
    return axios.put("/invoice", invoice);
}

export const deleteInvoice = (id) => {
    return axios.delete(`/invoice/${id}`);
}
