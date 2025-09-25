import axios from "axios";

export const getNewsletters = () => {
    return axios.get("/newletters");
}

export const addNewsletter = (newsletter) => {
    return axios.post("/newletter", newsletter);
}

export const updateNewsletter = (newsletter) => {
    return axios.put("/newletter", newsletter);
}

export const deleteNewsletter = (id) => {
    return axios.delete(`/newletter/${id}`);
}
