import axios from "axios";

export const getCustomerPromotionCodes = () => {
    return axios.get("/customerPromotionCodes");
}

export const addCustomerPromotionCode = (customerPromotionCode) => {
    return axios.post("/customerPromotionCode", customerPromotionCode);
}

export const updateCustomerPromotionCode = (customerPromotionCode) => {
    return axios.put("/customerPromotionCode", customerPromotionCode);
}

export const deleteCustomerPromotionCode = (id) => {
    return axios.delete(`/customerPromotionCode/${id}`);
}
