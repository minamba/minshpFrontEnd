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


  
//pagination 
export const getCustomersPaged = (params = {}) => {
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
  
    return axios.get(`/customersPagination?${usp.toString()}`);
  };

