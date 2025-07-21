import axios from "axios";

export const getVideos = () => {
    return axios.get("/videos");
}

export const addVideo = (video) => {
    return axios.post("/video", video);
}

export const updateVideo = (video) => {
    return axios.put("/video", video);
}

export const deleteVideo = (id) => {
    return axios.delete(`/video/${id}`);
}
