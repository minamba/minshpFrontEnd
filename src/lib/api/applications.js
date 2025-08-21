import axios from "axios";

export const getApplication = () => {
    return axios.get("/application");
}

export const addApplication = (application) => {
    return axios.post("/application", application);
}

export const updateApplication = (application) => {
    return axios.put("/application", application);
}

export const deleteApplication = (id) => {
    return axios.delete(`/application/${id}`);
}
