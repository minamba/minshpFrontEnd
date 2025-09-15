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

