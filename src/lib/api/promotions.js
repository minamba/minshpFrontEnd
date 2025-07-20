import axios from "axios";

export const getPromotions = () => {
    return axios.get("/promotions");
}

export const addPromotion = (promotion) => {
    return axios.post("/promotion", promotion);
}

export const updatePromotion = (promotion) => {
    return axios.put("/promotion", promotion);
}

export const deletePromotion = (id) => {
    return axios.delete(`/promotion/${id}`);
}
 