import axios from "axios";

export const getFeatureCategories = () => {
    return axios.get("/featureCategories");
}

export const addFeatureCategory = (featureCategory) => {
    return axios.post("/featureCategory", featureCategory);
}

export const updateFeatureCategory = (featureCategory) => {
    return axios.put("/featureCategory", featureCategory);
}

export const deleteFeatureCategory = (id) => {
    return axios.delete(`/featureCategory/${id}`);
}

export const getFeaturesCategoryByProduct = (idProduct) => {
    return axios.get(`/featuresCategoryByProduct/${idProduct}`);
}
