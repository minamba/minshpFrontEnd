export const actionsCustomerRate = {
    GET_CUSTOMER_RATE_REQUEST : "GET_CUSTOMER_RATE_REQUEST",
    GET_CUSTOMER_RATE_SUCCESS : "GET_CUSTOMER_RATE_SUCCESS",
    GET_CUSTOMER_RATE_FAILURE : "GET_CUSTOMER_RATE_FAILURE",

    UPDATE_CUSTOMER_RATE_REQUEST : "UPDATE_CUSTOMER_RATE_REQUEST",
    UPDATE_CUSTOMER_RATE_SUCCESS : "UPDATE_CUSTOMER_RATE_SUCCESS",
    UPDATE_CUSTOMER_RATE_FAILURE : "UPDATE_CUSTOMER_RATE_FAILURE",

    DELETE_CUSTOMER_RATE_REQUEST : "DELETE_CUSTOMER_RATE_REQUEST",
    DELETE_CUSTOMER_RATE_SUCCESS : "DELETE_CUSTOMER_RATE_SUCCESS",
    DELETE_CUSTOMER_RATE_FAILURE : "DELETE_CUSTOMER_RATE_FAILURE",

    ADD_CUSTOMER_RATE_REQUEST : "ADD_CUSTOMER_RATE_REQUEST",
    ADD_CUSTOMER_RATE_SUCCESS : "ADD_CUSTOMER_RATE_SUCCESS",
    ADD_CUSTOMER_RATE_FAILURE : "ADD_CUSTOMER_RATE_FAILURE",
}


//get
export function getCustomerRateRequest() {
    return {
        type: actionsCustomerRate.GET_CUSTOMER_RATE_REQUEST,
    }
}

export function getCustomerRateSuccess(customerRates) {
    return {
        type: actionsCustomerRate.GET_CUSTOMER_RATE_SUCCESS,
        payload: customerRates,
    }
}

export function getCustomerRateFailure(error) {
    return {
        type: actionsCustomerRate.GET_CUSTOMER_RATE_FAILURE,
        payload: error,
    }
}


//update
export function updateCustomerRateRequest(customerRate) {
    return {
        type: actionsCustomerRate.UPDATE_CUSTOMER_RATE_REQUEST,
        payload: customerRate,
    }
}

export function updateCustomerRateSuccess(customerRate) {
    return {
        type: actionsCustomerRate.UPDATE_CUSTOMER_RATE_SUCCESS,
        payload: customerRate,
    }
}

export function updateCustomerRateFailure(error) {
    return {
        type: actionsCustomerRate.UPDATE_CUSTOMER_RATE_FAILURE,
        payload: error,
    }
}


//delete
export function deleteCustomerRateRequest(IdCustomerRate) {
    return {
        type: actionsCustomerRate.DELETE_CUSTOMER_RATE_REQUEST,
        payload: IdCustomerRate,
    }
}

export function deleteCustomerRateSuccess(IdCustomerRate) {
    return {
        type: actionsCustomerRate.DELETE_CUSTOMER_RATE_SUCCESS,
        payload: IdCustomerRate,
    }
}

export function deleteCustomerRateFailure(error) {
    return {
        type: actionsCustomerRate.DELETE_CUSTOMER_RATE_FAILURE,
        payload: error,
    }
}


//add
export function addCustomerRateRequest(customerRate) {
    return {
        type: actionsCustomerRate.ADD_CUSTOMER_RATE_REQUEST,
        payload: customerRate,
    }
}

export function addCustomerRateSuccess(customerRate) {
    return {
        type: actionsCustomerRate.ADD_CUSTOMER_RATE_SUCCESS,
        payload: customerRate,
    }
}

export function addCustomerRateFailure(error) {
    return {
        type: actionsCustomerRate.ADD_CUSTOMER_RATE_FAILURE,
        payload: error,
    }
}

