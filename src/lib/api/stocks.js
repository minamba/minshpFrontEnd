import axios from "axios";

export const getStocks = () => {
    return axios.get("/stocks");
}

// export const addProduct = (product) => {
//     return axios.post("/product", product);
// }

export const updateStock = (stock) => {
    return axios.put("/stock", stock);
}

// export const deleteProduct = (id) => {
//     return axios.delete(`/product/${id}`);
// }
