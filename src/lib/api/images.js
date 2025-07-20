import axios from "axios";

export const getImages = () => {
    return axios.get("/images");
}

export const addImage = (image) => {
    return axios.post("/image", image);
}

export const updateImage = (image) => {
    return axios.put("/image", image);
}

export const deleteImage = (id) => {
    return axios.delete(`/image/${id}`);
}
