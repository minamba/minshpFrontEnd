import axios from "axios";

export const getStocks = () => {
    return axios.get("/stocks");
}

export const addStock = (stock) => {
    return axios.post("/stock", stock);
}

export const updateStock = (stock) => {
    return axios.put("/stock", stock);
}

export const deleteStock = (id) => {
    return axios.delete(`/stock/${id}`);
}
