export const actionsPromotion = {
    GET_PROMOTION_REQUEST : "GET_PROMOTION_REQUEST",
    GET_PROMOTION_SUCCESS : "GET_PROMOTION_SUCCESS",
    GET_PROMOTION_FAILURE : "GET_PROMOTION_FAILURE",

    UPDATE_PROMOTION_REQUEST : "UPDATE_PROMOTION_REQUEST",
    UPDATE_PROMOTION_SUCCESS : "UPDATE_PROMOTION_SUCCESS",
    UPDATE_PROMOTION_FAILURE : "UPDATE_PROMOTION_FAILURE",

    DELETE_PROMOTION_REQUEST : "DELETE_PROMOTION_REQUEST",
    DELETE_PROMOTION_SUCCESS : "DELETE_PROMOTION_SUCCESS",
    DELETE_PROMOTION_FAILURE : "DELETE_PROMOTION_FAILURE",

    ADD_PROMOTION_REQUEST : "ADD_PROMOTION_REQUEST",
    ADD_PROMOTION_SUCCESS : "ADD_PROMOTION_SUCCESS",
    ADD_PROMOTION_FAILURE : "ADD_PROMOTION_FAILURE",
}


//get
export function getPromotionRequest() {
    return {
        type: actionsPromotion.GET_PROMOTION_REQUEST,
    }
}

export function getPromotionSuccess(promotions) {
    return {
        type: actionsPromotion.GET_PROMOTION_SUCCESS,
        payload: promotions,
    }
}

export function getPromotionFailure(error) {
    return {
        type: actionsPromotion.GET_PROMOTION_FAILURE,
        payload: error,
    }
}


//update
export function updatePromotionRequest(promotion) {
    return {
        type: actionsPromotion.UPDATE_PROMOTION_REQUEST,
        payload: promotion,
    }
}

export function updatePromotionSuccess(promotion) {
    return {
        type: actionsPromotion.UPDATE_PROMOTION_SUCCESS,
        payload: promotion,
    }
}

export function updatePromotionFailure(error) {
    return {
        type: actionsPromotion.UPDATE_PROMOTION_FAILURE,
        payload: error,
    }
}


//delete
export function deletePromotionRequest(IdPromotion) {
    return {
        type: actionsPromotion.DELETE_PROMOTION_REQUEST,
        payload: IdPromotion,
    }
}

export function deletePromotionSuccess(IdPromotion) {
    return {
        type: actionsPromotion.DELETE_PROMOTION_SUCCESS,
        payload: IdPromotion,
    }
}

export function deletePromotionFailure(error) {
    return {
        type: actionsPromotion.DELETE_PROMOTION_FAILURE,
        payload: error,
    }
}


//add
export function addPromotionRequest(promotion) {
    return {
        type: actionsPromotion.ADD_PROMOTION_REQUEST,
        payload: promotion,
    }
}

export function addPromotionSuccess(promotion) {
    return {
        type: actionsPromotion.ADD_PROMOTION_SUCCESS,
        payload: promotion,
    }
}

export function addPromotionFailure(error) {
    return {
        type: actionsPromotion.ADD_PROMOTION_FAILURE,
        payload: error,
    }
}

