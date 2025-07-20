import axios from "axios";

export const getCategories = () => {
    return axios.get("/categories");
}

export const addCategory = (category) => {
    return axios.post("/category", category);
}

export const updateCategory = (category) => {
    return axios.put("/category", category);
}

export const deleteCategory = (id) => {
    return axios.delete(`/category/${id}`);
}
