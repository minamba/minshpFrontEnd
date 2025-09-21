export const actionsCustomerPromotionCode = {
    GET_CUSTOMER_PROMOTION_CODE_REQUEST : "GET_CUSTOMER_PROMOTION_CODE_REQUEST",
    GET_CUSTOMER_PROMOTION_CODE_SUCCESS : "GET_CUSTOMER_PROMOTION_CODE_SUCCESS",
    GET_CUSTOMER_PROMOTION_CODE_FAILURE : "GET_CUSTOMER_PROMOTION_CODE_FAILURE",

    UPDATE_CUSTOMER_PROMOTION_CODE_REQUEST : "UPDATE_CUSTOMER_PROMOTION_CODE_REQUEST",
    UPDATE_CUSTOMER_PROMOTION_CODE_SUCCESS : "UPDATE_CUSTOMER_PROMOTION_CODE_SUCCESS",
    UPDATE_CUSTOMER_PROMOTION_CODE_FAILURE : "UPDATE_CUSTOMER_PROMOTION_CODE_FAILURE",

    DELETE_CUSTOMER_PROMOTION_CODE_REQUEST : "DELETE_CUSTOMER_PROMOTION_CODE_REQUEST",
    DELETE_CUSTOMER_PROMOTION_CODE_SUCCESS : "DELETE_CUSTOMER_PROMOTION_CODE_SUCCESS",
    DELETE_CUSTOMER_PROMOTION_CODE_FAILURE : "DELETE_CUSTOMER_PROMOTION_CODE_FAILURE",

    ADD_CUSTOMER_PROMOTION_CODE_REQUEST : "ADD_CUSTOMER_PROMOTION_CODE_REQUEST",
    ADD_CUSTOMER_PROMOTION_CODE_SUCCESS : "ADD_CUSTOMER_PROMOTION_CODE_SUCCESS",
    ADD_CUSTOMER_PROMOTION_CODE_FAILURE : "ADD_CUSTOMER_PROMOTION_CODE_FAILURE",
}


//get
export function getCustomerPromotionCodeRequest() {
    return {
        type: actionsCustomerPromotionCode.GET_CUSTOMER_PROMOTION_CODE_REQUEST,
    }
}

export function getCustomerPromotionCodeSuccess(application) {
    return {
        type: actionsCustomerPromotionCode.GET_CUSTOMER_PROMOTION_CODE_SUCCESS,
        payload: application,
    }
}

export function getCustomerPromotionCodeFailure(error) {
    return {
        type: actionsCustomerPromotionCode.GET_CUSTOMER_PROMOTION_CODE_FAILURE,
        payload: error,
    }
}


//update
export function updateCustomerPromotionCodeRequest(application) {
    return {
        type: actionsCustomerPromotionCode.UPDATE_CUSTOMER_PROMOTION_CODE_REQUEST,
        payload: application,
    }
}

export function updateCustomerPromotionCodeSuccess(application) {
    return {
        type: actionsCustomerPromotionCode.UPDATE_CUSTOMER_PROMOTION_CODE_SUCCESS,
        payload: application,
    }
}

export function updateCustomerPromotionCodeFailure(error) {
    return {
        type: actionsCustomerPromotionCode.UPDATE_CUSTOMER_PROMOTION_CODE_FAILURE,
        payload: error,
    }
}


//delete
export function deleteCustomerPromotionCodeRequest(IdApplication) {
    return {
        type: actionsCustomerPromotionCode.DELETE_CUSTOMER_PROMOTION_CODE_REQUEST,
        payload: IdApplication,
    }
}

export function deleteCustomerPromotionCodeSuccess(IdApplication) {
    return {
        type: actionsCustomerPromotionCode.DELETE_CUSTOMER_PROMOTION_CODE_SUCCESS,
        payload: IdApplication,
    }
}

export function deleteCustomerPromotionCodeFailure(error) {
    return {
        type: actionsCustomerPromotionCode.DELETE_CUSTOMER_PROMOTION_CODE_FAILURE,
        payload: error,
    }
}


//add
export function addCustomerPromotionCodeRequest(application) {
    return {
        type: actionsCustomerPromotionCode.ADD_CUSTOMER_PROMOTION_CODE_REQUEST,
        payload: application,
    }
}

export function addCustomerPromotionCodeSuccess(application) {
    return {
        type: actionsCustomerPromotionCode.ADD_CUSTOMER_PROMOTION_CODE_SUCCESS,
        payload: application,
    }
}

export function addCustomerPromotionCodeFailure(error) {
    return {
        type: actionsCustomerPromotionCode.ADD_CUSTOMER_PROMOTION_CODE_FAILURE,
        payload: error,
    }
}

