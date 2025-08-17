export const actionsCart = {
    GET_CART_REQUEST : "GET_CART_REQUEST",
    GET_CART_SUCCESS : "GET_CART_SUCCESS",
    GET_CART_FAILURE : "GET_CART_FAILURE",

    UPDATE_CART_REQUEST : "UPDATE_CART_REQUEST",
    UPDATE_CART_SUCCESS : "UPDATE_CART_SUCCESS",
    UPDATE_CART_FAILURE : "UPDATE_CART_FAILURE",

    DELETE_FROM_CART_REQUEST : "DELETE_FROM_CART_REQUEST",
    DELETE_FROM_CART_SUCCESS : "DELETE_FROM_CART_SUCCESS",
    DELETE_FROM_CART_FAILURE : "DELETE_FROM_CART_FAILURE",

    ADD_TO_CART_REQUEST : "ADD_TO_CART_REQUEST",
    ADD_TO_CART_SUCCESS : "ADD_TO_CART_SUCCESS",
    ADD_TO_CART_FAILURE : "ADD_TO_CART_FAILURE",


    SAVE_CART_REQUEST : "SAVE_CART_REQUEST",
    SAVE_CART_SUCCESS : "SAVE_CART_SUCCESS",
    SAVE_CART_FAILURE : "SAVE_CART_FAILURE",
}

//get
export function getCartRequest() {
    return {
        type: actionsCart.GET_CART_REQUEST,
    }
}

export function getCartSuccess(items) {
    return {
        type: actionsCart.GET_CART_SUCCESS,
        payload: items,
    }
}

export function getCartFailure(error) {
    return {
        type: actionsCart.GET_CART_FAILURE,
        payload: error,
    }
}


//update
export function updateCartRequest(item, quantity) {
    return {
        type: actionsCart.UPDATE_CART_REQUEST,
        payload: {item, quantity},
    }
}

export function updateCartSuccess(item, quantity) {
    return {    
        type: actionsCart.UPDATE_CART_SUCCESS,
        payload: {item, quantity},
    }
}

export function updateCartFailure(error) {
    return {
        type: actionsCart.UPDATE_CART_FAILURE,
        payload: error,
    }
}


//delete
export function deleteFromCartRequest(IdCart) {
    return {
        type: actionsCart.DELETE_FROM_CART_REQUEST,
        payload: IdCart,
    }
}

export function deleteFromCartSuccess(IdCart) {
    return {
        type: actionsCart.DELETE_FROM_CART_SUCCESS,
        payload: IdCart,
    }
}

export function deleteFromCartFailure(error) {
    return {
        type: actionsCart.DELETE_FROM_CART_FAILURE,
        payload: error,
    }
}


//add
export function addToCartRequest(item, quantity) {
    return {
        type: actionsCart.ADD_TO_CART_REQUEST,
        payload: {item, quantity}, 
    }
}

export function addToCartSuccess(item, quantity) {
    return {
        type: actionsCart.ADD_TO_CART_SUCCESS,
        payload: {item, quantity},
    }
}

export function addToCartFailure(error) {
    return {
        type: actionsCart.ADD_TO_CART_FAILURE,
        payload: error,
    }
}

//save
export function saveCartRequest(items) {
    return {
        type: actionsCart.SAVE_CART_REQUEST,
        payload: items,
    }
}

export function saveCartSuccess(items) {
    return {
        type: actionsCart.SAVE_CART_SUCCESS,
        payload: items,
    }
}

export function saveCartFailure(error) {
    return {
        type: actionsCart.SAVE_CART_FAILURE,
        payload: error,
    }
}
