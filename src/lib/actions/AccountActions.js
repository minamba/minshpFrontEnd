export const actionsAccount = {
    LOGIN_REQUEST : "LOGIN_REQUEST",
    LOGIN_SUCCESS : "LOGIN_SUCCESS",
    LOGIN_FAILURE : "LOGIN_FAILURE",
    LOGOUT        : "LOGOUT",


    REGISTER_REQUEST : "REGISTER_REQUEST",
    REGISTER_SUCCESS : "REGISTER_SUCCESS",
    REGISTER_FAILURE : "REGISTER_FAILURE",
    REGISTER_CLEAR:   "REGISTER_CLEAR",

    UPDATE_USER_REQUEST : "UPDATE_USER_REQUEST",
    UPDATE_USER_SUCCESS : "UPDATE_USER_SUCCESS",
    UPDATE_USER_FAILURE : "UPDATE_USER_FAILURE",

    ADD_USER_REQUEST : "ADD_USER_REQUEST",
    ADD_USER_SUCCESS : "ADD_USER_SUCCESS",
    ADD_USER_FAILURE : "ADD_USER_FAILURE",

    DELETE_USER_REQUEST : "DELETE_USER_REQUEST",
    DELETE_USER_SUCCESS : "DELETE_USER_SUCCESS",
    DELETE_USER_FAILURE : "DELETE_USER_FAILURE",

    UPDATE_USER_PASSWORD_REQUEST : "UPDATE_USER_PASSWORD_REQUEST",
    UPDATE_USER_PASSWORD_SUCCESS : "UPDATE_USER_PASSWORD_SUCCESS",
    UPDATE_USER_PASSWORD_FAILURE : "UPDATE_USER_PASSWORD_FAILURE",

    UPDATE_USER_RESET: "UPDATE_USER_RESET",
    UPDATE_USER_PASSWORD_RESET: "UPDATE_USER_PASSWORD_RESET",
}


//get
export function loginRequest(loginInfo) {
    return {
        type: actionsAccount.LOGIN_REQUEST,
        payload: loginInfo,
    }
}

export function loginSuccess({response, user}) {
    return {
        type: actionsAccount.LOGIN_SUCCESS,
        payload: {response, user},
    }
}

export function loginFailure(error) {
    return {
        type: actionsAccount.LOGIN_FAILURE,
        payload: error,
    }
}

//logout
export function logout() {
    return {
        type: actionsAccount.LOGOUT,
    }
}


//post
export function registerRequest(data) {
    return {
        type: actionsAccount.REGISTER_REQUEST,
        payload: data,
    }
}

export function registerSuccess(data) {
    return {
        type: actionsAccount.REGISTER_SUCCESS,
        payload: data,
    }
}

export function registerFailure(error) {
    return {
        type: actionsAccount.REGISTER_FAILURE,
        payload: error,
    }
}


//update
export function updateUserRequest(data) {
    return {
        type: actionsAccount.UPDATE_USER_REQUEST,
        payload: data,
    }
}

export function updateUserSuccess(data) {
    return {
        type: actionsAccount.UPDATE_USER_SUCCESS,
        payload: data,
    }
}

export function updateUserFailure(error) {
    return {
        type: actionsAccount.UPDATE_USER_FAILURE,
        payload: error,
    }
}

//delete
export function deleteUserRequest(id) {
    return {
        type: actionsAccount.DELETE_USER_REQUEST,
        payload: id,
    }
}

export function deleteUserSuccess(id) {
    return {
        type: actionsAccount.DELETE_USER_SUCCESS,
        payload: id,
    }
}

export function deleteUserFailure(error) {
    return {
        type: actionsAccount.DELETE_USER_FAILURE,
        payload: error,
    }
}

//update password
export function updateUserPasswordRequest(data) {
    return {
        type: actionsAccount.UPDATE_USER_PASSWORD_REQUEST,
        payload: data,
    }
}

export function updateUserPasswordSuccess(data) {
    return {
        type: actionsAccount.UPDATE_USER_PASSWORD_SUCCESS,
        payload: data,
    }
}

export function updateUserPasswordFailure(error) {
    return {
        type: actionsAccount.UPDATE_USER_PASSWORD_FAILURE,
        payload: error,
    }
}

export const updateUserReset = () => ({
    type: actionsAccount.UPDATE_USER_RESET,
  });
  
  export const updateUserPasswordReset = () => ({
    type: actionsAccount.UPDATE_USER_PASSWORD_RESET,
  });

export const registerClear = () => ({ type: actionsAccount.REGISTER_CLEAR });



