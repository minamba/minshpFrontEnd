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

export const deleteInvoice = (invoice) => {
    return axios.delete("/invoice", {
      headers: { "Content-Type": "application/json" },
      data: invoice, // <-- le body est bien ici
    });
  };
