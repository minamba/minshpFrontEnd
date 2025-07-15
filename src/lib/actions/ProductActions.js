export const actionsProduct = {
    GET_PRODUCT_USER_REQUEST : "GET_PRODUCT_USER_REQUEST",
    GET_PRODUCT_USER_SUCCESS : "GET_PRODUCT_USER_SUCCESS",
    GET_PRODUCT_USER_FAILURE : "GET_PRODUCT_USER_FAILURE",

    UPDATE_PRODUCT_USER_REQUEST : "UPDATE_PRODUCT_USER_REQUEST",
    UPDATE_PRODUCT_USER_SUCCESS : "UPDATE_PRODUCT_USER_SUCCESS",
    UPDATE_PRODUCT_USER_FAILURE : "UPDATE_PRODUCT_USER_FAILURE",

    DELETE_PRODUCT_USER_REQUEST : "DELETE_PRODUCT_USER_REQUEST",
    DELETE_PRODUCT_USER_SUCCESS : "DELETE_PRODUCT_USER_SUCCESS",
    DELETE_PRODUCT_USER_FAILURE : "DELETE_PRODUCT_USER_FAILURE",

    ADD_PRODUCT_USER_REQUEST : "ADD_PRODUCT_USER_REQUEST",
    ADD_PRODUCT_USER_SUCCESS : "ADD_PRODUCT_USER_SUCCESS",
    ADD_PRODUCT_USER_FAILURE : "ADD_PRODUCT_USER_FAILURE",
}


//get
export function getProductUserRequest() {
    return {
        type: actionsProduct.GET_PRODUCT_USER_REQUEST,
    }
}

export function getProductUserSuccess(products) {
    return {
        type: actionsProduct.GET_PRODUCT_USER_SUCCESS,
        payload: products,
    }
}

export function getProductUserFailure(error) {
    return {
        type: actionsProduct.GET_PRODUCT_USER_FAILURE,
        payload: error,
    }
}


//update
export function updateProductUserRequest() {
    return {
        type: actionsProduct.UPDATE_PRODUCT_USER_REQUEST,
    }
}

export function updateProductUserSuccess(product) {
    return {
        type: actionsProduct.UPDATE_PRODUCT_USER_SUCCESS,
        payload: product,
    }
}

export function updateProductUserFailure(error) {
    return {
        type: actionsProduct.UPDATE_PRODUCT_USER_FAILURE,
        payload: error,
    }
}


//delete
export function deleteProductUserRequest() {
    return {
        type: actionsProduct.DELETE_PRODUCT_USER_REQUEST,
    }
}

export function deleteProductUserSuccess(product) {
    return {
        type: actionsProduct.DELETE_PRODUCT_USER_SUCCESS,
        payload: product,
    }
}

export function deleteProductUserFailure(error) {
    return {
        type: actionsProduct.DELETE_PRODUCT_USER_FAILURE,
        payload: error,
    }
}


//add
export function addProductUserRequest() {
    return {
        type: actionsProduct.ADD_PRODUCT_USER_REQUEST,
    }
}

export function addProductUserSuccess(product) {
    return {
        type: actionsProduct.ADD_PRODUCT_USER_SUCCESS,
        payload: product,
    }
}

export function addProductUserFailure(error) {
    return {
        type: actionsProduct.ADD_PRODUCT_USER_FAILURE,
        payload: error,
    }
}

