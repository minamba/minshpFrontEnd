export const actionsPromotionCode = {
    GET_PROMOTION_CODE_REQUEST : "GET_PROMOTION_CODE_REQUEST",
    GET_PROMOTION_CODE_SUCCESS : "GET_PROMOTION_CODE_SUCCESS",
    GET_PROMOTION_CODE_FAILURE : "GET_PROMOTION_CODE_FAILURE",

    UPDATE_PROMOTION_CODE_REQUEST : "UPDATE_PROMOTION_CODE_REQUEST",
    UPDATE_PROMOTION_CODE_SUCCESS : "UPDATE_PROMOTION_CODE_SUCCESS",
    UPDATE_PROMOTION_CODE_FAILURE : "UPDATE_PROMOTION_CODE_FAILURE",

    DELETE_PROMOTION_CODE_REQUEST : "DELETE_PROMOTION_CODE_REQUEST",
    DELETE_PROMOTION_CODE_SUCCESS : "DELETE_PROMOTION_CODE_SUCCESS",
    DELETE_PROMOTION_CODE_FAILURE : "DELETE_PROMOTION_CODE_FAILURE",

    ADD_PROMOTION_CODE_REQUEST : "ADD_PROMOTION_CODE_REQUEST",
    ADD_PROMOTION_CODE_SUCCESS : "ADD_PROMOTION_CODE_SUCCESS",
    ADD_PROMOTION_CODE_FAILURE : "ADD_PROMOTION_CODE_FAILURE",
}


//get
export function getPromotionCodesRequest() {
    return {
        type: actionsPromotionCode.GET_PROMOTION_CODE_REQUEST,
    }
}

export function getPromotionCodesSuccess(promotionCodes) {
    return {
        type: actionsPromotionCode.GET_PROMOTION_CODE_SUCCESS,
        payload: promotionCodes,
    }
}

export function getPromotionCodesFailure(error) {
    return {
        type: actionsPromotionCode.GET_PROMOTION_CODE_FAILURE,
        payload: error,
    }
}


//update
export function updatePromotionCodeRequest(promotionCode) {
    return {
        type: actionsPromotionCode.UPDATE_PROMOTION_CODE_REQUEST,
        payload: promotionCode,
    }
}

export function updatePromotionCodeSuccess(promotionCode) {
    return {
        type: actionsPromotionCode.UPDATE_PROMOTION_CODE_SUCCESS,
        payload: promotionCode,
    }
}

export function updatePromotionCodeFailure(error) {
    return {
        type: actionsPromotionCode.UPDATE_PROMOTION_CODE_FAILURE,
        payload: error,
    }
}


//delete
export function deletePromotionCodeRequest(IdPromotionCode) {
    return {
        type: actionsPromotionCode.DELETE_PROMOTION_CODE_REQUEST,
        payload: IdPromotionCode,
    }
}

export function deletePromotionCodeSuccess(IdPromotionCode) {
    return {
        type: actionsPromotionCode.DELETE_PROMOTION_CODE_SUCCESS,
        payload: IdPromotionCode,
    }
}

export function deletePromotionCodeFailure(error) {
    return {
        type: actionsPromotionCode.DELETE_PROMOTION_CODE_FAILURE,
        payload: error,
    }
}


//add
export function addPromotionCodeRequest(promotionCode) {
    return {
        type: actionsPromotionCode.ADD_PROMOTION_CODE_REQUEST,
        payload: promotionCode,
    }
}

export function addPromotionCodeSuccess(promotionCode) {
    return {
        type: actionsPromotionCode.ADD_PROMOTION_CODE_SUCCESS,
        payload: promotionCode,
    }
}

export function addPromotionCodeFailure(error) {
    return {
        type: actionsPromotionCode.ADD_PROMOTION_CODE_FAILURE,
        payload: error,
    }
}

