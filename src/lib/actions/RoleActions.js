export const actionsRole = {
    GET_ROLE_REQUEST : "GET_ROLE_REQUEST",
    GET_ROLE_SUCCESS : "GET_ROLE_SUCCESS",
    GET_ROLE_FAILURE : "GET_ROLE_FAILURE",
}


//get
export function getRolesRequest() {
    return {
        type: actionsRole.GET_ROLE_REQUEST,
    }
}

export function getRolesSuccess(roles) {
    return {
        type: actionsRole.GET_ROLE_SUCCESS,
        payload: roles,
    }
}

export function getRolesFailure(error) {
    return {
        type: actionsRole.GET_ROLE_FAILURE,
        payload: error,
    }
}
