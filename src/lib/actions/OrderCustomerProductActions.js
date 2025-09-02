export const actionsOrderCustomerProduct = {
    GET_ORDER_CUSTOMER_PRODUCT_REQUEST : "GET_ORDER_CUSTOMER_PRODUCT_REQUEST",
    GET_ORDER_CUSTOMER_PRODUCT_SUCCESS : "GET_ORDER_CUSTOMER_PRODUCT_SUCCESS",
    GET_ORDER_CUSTOMER_PRODUCT_FAILURE : "GET_ORDER_CUSTOMER_PRODUCT_FAILURE",

    UPDATE_ORDER_CUSTOMER_PRODUCT_REQUEST : "UPDATE_ORDER_CUSTOMER_PRODUCT_REQUEST",
    UPDATE_ORDER_CUSTOMER_PRODUCT_SUCCESS : "UPDATE_ORDER_CUSTOMER_PRODUCT_SUCCESS",
    UPDATE_ORDER_CUSTOMER_PRODUCT_FAILURE : "UPDATE_ORDER_CUSTOMER_PRODUCT_FAILURE",

    DELETE_ORDER_CUSTOMER_PRODUCT_REQUEST : "DELETE_ORDER_CUSTOMER_PRODUCT_REQUEST",
    DELETE_ORDER_CUSTOMER_PRODUCT_SUCCESS : "DELETE_ORDER_CUSTOMER_PRODUCT_SUCCESS",
    DELETE_ORDER_CUSTOMER_PRODUCT_FAILURE : "DELETE_ORDER_CUSTOMER_PRODUCT_FAILURE",

    ADD_ORDER_CUSTOMER_PRODUCT_REQUEST : "ADD_ORDER_CUSTOMER_PRODUCT_REQUEST",
    ADD_ORDER_CUSTOMER_PRODUCT_SUCCESS : "ADD_ORDER_CUSTOMER_PRODUCT_SUCCESS",
    ADD_ORDER_CUSTOMER_PRODUCT_FAILURE : "ADD_ORDER_CUSTOMER_PRODUCT_FAILURE",
}


//get
export function getOrderCustomerProductRequest() {
    return {
        type: actionsOrderCustomerProduct.GET_ORDER_CUSTOMER_PRODUCT_REQUEST,
    }
}

export function getOrderCustomerProductSuccess(orderProducts) {
    return {
        type: actionsOrderCustomerProduct.GET_ORDER_CUSTOMER_PRODUCT_SUCCESS,
        payload: orderProducts,
    }
}

export function getOrderCustomerProductFailure(error) {
    return {
        type: actionsOrderCustomerProduct.GET_ORDER_CUSTOMER_PRODUCT_FAILURE,
        payload: error,
    }
}


//update
export function updateOrderCustomerProductRequest(orderProduct) {
    return {
        type: actionsOrderCustomerProduct.UPDATE_ORDER_CUSTOMER_PRODUCT_REQUEST,
        payload: orderProduct,
    }
}

export function updateOrderCustomerProductSuccess(orderProduct) {
    return {
        type: actionsOrderCustomerProduct.UPDATE_ORDER_CUSTOMER_PRODUCT_SUCCESS,
        payload: orderProduct,
    }
}

export function updateOrderCustomerProductFailure(error) {
    return {
        type: actionsOrderCustomerProduct.UPDATE_ORDER_CUSTOMER_PRODUCT_FAILURE,
        payload: error,
    }
}


//delete
export function deleteOrderCustomerProductRequest(orderProduct) {
    return {
        type: actionsOrderCustomerProduct.DELETE_ORDER_CUSTOMER_PRODUCT_REQUEST,
        payload: orderProduct,
    }
}

export function deleteOrderCustomerProductSuccess(orderProduct) {
    return {
        type: actionsOrderCustomerProduct.DELETE_ORDER_CUSTOMER_PRODUCT_SUCCESS,
        payload: orderProduct,
    }
}

export function deleteOrderCustomerProductFailure(error) {
    return {
        type: actionsOrderCustomerProduct.DELETE_ORDER_CUSTOMER_PRODUCT_FAILURE,
        payload: error,
    }
}


//add
export function addOrderCustomerProductRequest(orderProduct) {
    return {
        type: actionsOrderCustomerProduct.ADD_ORDER_CUSTOMER_PRODUCT_REQUEST,
        payload: orderProduct,
    }
}

export function addOrderCustomerProductSuccess(orderProduct) {
    return {
        type: actionsOrderCustomerProduct.ADD_ORDER_CUSTOMER_PRODUCT_SUCCESS,
        payload: orderProduct,
    }
}

export function addOrderCustomerProductFailure(error) {
    return {
        type: actionsOrderCustomerProduct.ADD_ORDER_CUSTOMER_PRODUCT_FAILURE,
        payload: error,
    }
}

