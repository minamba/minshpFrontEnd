import { combineReducers } from "redux";
import productReducer from "./ProductReducers";

export default combineReducers({
    products : productReducer
})