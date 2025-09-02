import axios from "axios";

export const getOrderProducts = () => {
    return axios.get("/orderCustomerProducts");
}

export const addOrderProduct = (orderProduct) => {
    return axios.post("/orderCustomerProduct", orderProduct);
}

export const updateOrderProduct = (orderProduct) => {
    return axios.put("/orderCustomerProduct", orderProduct);
}

export const deleteOrderProduct = (orderProduct) => {
    return axios.delete('/orderCustomerProduct', {
      data: orderProduct,                         // <— body
      headers: { 'Content-Type': 'application/json' }
    });
};
