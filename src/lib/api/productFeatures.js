import axios from "axios";

export const getProductFeatures = () => {
    return axios.get("/productFeatures");
}

export const addProductFeature = (feature) => {
    return axios.post("/productFeature", feature);
}

export const updateProductFeature = (feature) => {
    return axios.put("/productFeature", feature);
}

export const deleteProductFeature = (id) => {
    return axios.delete(`/productFeature/${id}`);
}
