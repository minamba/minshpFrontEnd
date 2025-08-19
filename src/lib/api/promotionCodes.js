import axios from "axios";

export const getPromotionCodes = () => {
    return axios.get("/promotionCodes");
}

export const addPromotionCode = (promotionCode) => {
    return axios.post("/promotionCode", promotionCode);
}

export const updatePromotionCode = (promotionCode) => {
    return axios.put("/promotionCode", promotionCode);
}

export const deletePromotionCode = (id) => {
    return axios.delete(`/promotionCode/${id}`);
}
