import axios from "axios";

export const getSubCategories = () => {
    return axios.get("/subCategories");
}

export const addSubCategory = (subCategory) => {
    return axios.post("/subCategory", subCategory);
}

export const updateSubCategory = (subCategory) => {
    return axios.put("/subCategory", subCategory);
}

export const deleteSubCategory = (id) => {
    return axios.delete(`/subCategory/${id}`);
}
