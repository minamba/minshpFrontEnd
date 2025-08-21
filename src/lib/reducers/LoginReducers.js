import { actionsLogin } from "../actions/LoginActions";


const token = localStorage.getItem("access_token");

const initialState = {
    isAuth:  !!token,
    loading: false,
    error: null,
}

export default function LoginReducer(state = initialState, action) {
    switch (action.type) {

        case actionsLogin.LOGIN_SUCCESS:
            return {
                ...state,
                isAuth: true,
            }

        case actionsLogin.LOGIN_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload.error  || "Échec de connexion",
            }
  
        case actionsLogin.LOGOUT:
            localStorage.removeItem("access_token");
            localStorage.removeItem("remember_email");
            return { ...state, isAuth: false };

        default:
            return state
    }
}