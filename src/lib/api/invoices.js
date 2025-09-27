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



  //pagination 
export const getInvoicesPaged = (params = {}) => {
    const usp = new URLSearchParams();
  
    if (params.page) usp.set("Page", String(params.page));
    if (params.pageSize) usp.set("PageSize", String(params.pageSize));
    if (params.search) usp.set("Search", params.search);
    if (params.sort) usp.set("Sort", params.sort);
  
    if (params.filter) {
      Object.entries(params.filter).forEach(([k, v]) => {
        if (v !== "" && v !== undefined && v !== null) {
          usp.set(`Filter.${k}`, String(v));
        }
      });
    }
  
    return axios.get(`/invoicesPagination?${usp.toString()}`);
  };
