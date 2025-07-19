import axios from "axios";

export const getFeatures = () => {
    return axios.get("/features");
}

export const addFeature = (feature) => {
    return axios.post("/feature", feature);
}

export const updateFeature = (feature) => {
    return axios.put("/feature", feature);
}

export const deleteFeature = (id) => {
    return axios.delete(`/feature/${id}`);
}
