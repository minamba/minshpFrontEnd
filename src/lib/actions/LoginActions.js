export const actionsLogin = {
    LOGIN_REQUEST : "LOGIN_REQUEST",
    LOGIN_SUCCESS : "LOGIN_SUCCESS",
    LOGIN_FAILURE : "LOGIN_FAILURE",
    LOGOUT        : "LOGOUT",
}


//get
export function loginRequest(loginInfo) {
    return {
        type: actionsLogin.LOGIN_REQUEST,
        payload: loginInfo,
    }
}

export function loginSuccess(response) {
    return {
        type: actionsLogin.LOGIN_SUCCESS,
        payload: response,
    }
}

export function loginFailure(error) {
    return {
        type: actionsLogin.LOGIN_FAILURE,
        payload: error,
    }
}

//logout
export function logout() {
    return {
        type: actionsLogin.LOGOUT,
    }
}


