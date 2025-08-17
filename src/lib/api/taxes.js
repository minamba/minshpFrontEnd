import axios from "axios";

export const getTaxes = () => {
    return axios.get("/taxes");
}

export const addTaxe = (taxe) => {
    return axios.post("/taxe", taxe);
}

export const updateTaxe = (taxe) => {
    return axios.put("/taxe", taxe);
}

export const deleteTaxe = (id) => {
    return axios.delete(`/taxe/${id}`);
}
