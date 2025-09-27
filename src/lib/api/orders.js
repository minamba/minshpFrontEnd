import axios from "axios";

export const getOrders = () => {
    return axios.get("/orders");
}

export const addOrder = (order) => {
    return axios.post("/order", order);
}

export const updateOrder = (order) => {
    return axios.put("/order", order);
}

export const deleteOrder = (id) => {
    return axios.delete(`/order/${id}`);
}

export const downloadInvoice = (orderId) => {
    return axios.get(`/order/${orderId}/invoice`, {
      responseType: "blob",
    });
  };



  
//pagination 
export const getOrdersPaged = (params = {}) => {
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
  
    return axios.get(`/ordersPagination?${usp.toString()}`);
  };

