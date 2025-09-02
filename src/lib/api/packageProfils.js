import axios from "axios";

export const getPackageProfils = () => {
    return axios.get("/packageProfils");
}

export const addPackageProfil = (packageprofil) => {
    return axios.post("/packageProfil", packageprofil);
}

export const updatePackageProfil = (packageprofil) => {
    return axios.put("/packageProfil", packageprofil);
}

export const deletePackageProfil = (id) => {
    return axios.delete(`/packageProfil/${id}`);
}
