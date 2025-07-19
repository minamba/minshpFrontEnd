import axios from "axios";

export const getProducts = () => {
    return axios.get("/products");
}

export const addProduct = (product) => {
    return axios.post("/product", product);
}

export const updateProduct = (product) => {
    return axios.put("/product", product);
}

export const deleteProduct = (id) => {
    return axios.delete(`/product/${id}`);
}
