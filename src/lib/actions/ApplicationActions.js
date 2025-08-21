export const actionsApplication = {
    GET_APPLICATION_REQUEST : "GET_APPLICATION_REQUEST",
    GET_APPLICATION_SUCCESS : "GET_APPLICATION_SUCCESS",
    GET_APPLICATION_FAILURE : "GET_APPLICATION_FAILURE",

    UPDATE_APPLICATION_REQUEST : "UPDATE_APPLICATION_REQUEST",
    UPDATE_APPLICATION_SUCCESS : "UPDATE_APPLICATION_SUCCESS",
    UPDATE_APPLICATION_FAILURE : "UPDATE_APPLICATION_FAILURE",

    DELETE_APPLICATION_REQUEST : "DELETE_APPLICATION_REQUEST",
    DELETE_APPLICATION_SUCCESS : "DELETE_APPLICATION_SUCCESS",
    DELETE_APPLICATION_FAILURE : "DELETE_APPLICATION_FAILURE",

    ADD_APPLICATION_REQUEST : "ADD_APPLICATION_REQUEST",
    ADD_APPLICATION_SUCCESS : "ADD_APPLICATION_SUCCESS",
    ADD_APPLICATION_FAILURE : "ADD_APPLICATION_FAILURE",
}


//get
export function getApplicationRequest() {
    return {
        type: actionsApplication.GET_APPLICATION_REQUEST,
    }
}

export function getApplicationSuccess(application) {
    return {
        type: actionsApplication.GET_APPLICATION_SUCCESS,
        payload: application,
    }
}

export function getApplicationFailure(error) {
    return {
        type: actionsApplication.GET_APPLICATION_FAILURE,
        payload: error,
    }
}


//update
export function updateApplicationRequest(application) {
    return {
        type: actionsApplication.UPDATE_APPLICATION_REQUEST,
        payload: application,
    }
}

export function updateApplicationSuccess(application) {
    return {
        type: actionsApplication.UPDATE_APPLICATION_SUCCESS,
        payload: application,
    }
}

export function updateApplicationFailure(error) {
    return {
        type: actionsApplication.UPDATE_APPLICATION_FAILURE,
        payload: error,
    }
}


//delete
export function deleteApplicationRequest(IdApplication) {
    return {
        type: actionsApplication.DELETE_APPLICATION_REQUEST,
        payload: IdApplication,
    }
}

export function deleteApplicationSuccess(IdApplication) {
    return {
        type: actionsApplication.DELETE_APPLICATION_SUCCESS,
        payload: IdApplication,
    }
}

export function deleteApplicationFailure(error) {
    return {
        type: actionsApplication.DELETE_APPLICATION_FAILURE,
        payload: error,
    }
}


//add
export function addApplicationRequest(application) {
    return {
        type: actionsApplication.ADD_APPLICATION_REQUEST,
        payload: application,
    }
}

export function addApplicationSuccess(application) {
    return {
        type: actionsApplication.ADD_APPLICATION_SUCCESS,
        payload: application,
    }
}

export function addApplicationFailure(error) {
    return {
        type: actionsApplication.ADD_APPLICATION_FAILURE,
        payload: error,
    }
}

