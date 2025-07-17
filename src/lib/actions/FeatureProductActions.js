export const actionsFeatureProduct = {
    GET_FEATURE_PRODUCT_REQUEST : "GET_FEATURE_PRODUCT_REQUEST",
    GET_FEATURE_PRODUCT_SUCCESS : "GET_FEATURE_PRODUCT_SUCCESS",
    GET_FEATURE_PRODUCT_FAILURE : "GET_FEATURE_PRODUCT_FAILURE",

    UPDATE_FEATURE_PRODUCT_REQUEST : "UPDATE_FEATURE_PRODUCT_REQUEST",
    UPDATE_FEATURE_PRODUCT_SUCCESS : "UPDATE_FEATURE_PRODUCT_SUCCESS",
    UPDATE_FEATURE_PRODUCT_FAILURE : "UPDATE_FEATURE_PRODUCT_FAILURE",

    DELETE_FEATURE_PRODUCT_REQUEST : "DELETE_FEATURE_PRODUCT_REQUEST",
    DELETE_FEATURE_PRODUCT_SUCCESS : "DELETE_FEATURE_PRODUCT_SUCCESS",
    DELETE_FEATURE_PRODUCT_FAILURE : "DELETE_FEATURE_PRODUCT_FAILURE",

    ADD_FEATURE_PRODUCT_REQUEST : "ADD_FEATURE_PRODUCT_REQUEST",
    ADD_FEATURE_PRODUCT_SUCCESS : "ADD_FEATURE_PRODUCT_SUCCESS",
    ADD_FEATURE_PRODUCT_FAILURE : "ADD_FEATURE_PRODUCT_FAILURE",
}


//get
export function getFeatureProductRequest() {
    return {
        type: actionsFeatureProduct.GET_FEATURE_PRODUCT_REQUEST,
    }
}

export function getFeatureProductSuccess(featureProducts) {
    return {
        type: actionsFeatureProduct.GET_FEATURE_PRODUCT_SUCCESS,
        payload: featureProducts,
    }
}

export function getFeatureProductFailure(error) {
    return {
        type: actionsFeatureProduct.GET_FEATURE_PRODUCT_FAILURE,
        payload: error,
    }
}


//update
export function updateFeatureProductRequest(featureProduct) {
    return {
        type: actionsFeatureProduct.UPDATE_FEATURE_PRODUCT_REQUEST,
        payload: featureProduct,
    }
}

export function updateFeatureProductSuccess(featureProduct) {
    return {
        type: actionsFeatureProduct.UPDATE_FEATURE_PRODUCT_SUCCESS,
        payload: featureProduct,
    }
}

export function updateFeatureProductFailure(error) {
    return {
        type: actionsFeatureProduct.UPDATE_FEATURE_PRODUCT_FAILURE,
        payload: error,
    }
}


//delete
export function deleteFeatureProductRequest(IdFeatureProduct) {
    return {
        type: actionsFeatureProduct.DELETE_FEATURE_PRODUCT_REQUEST,
        payload: IdFeatureProduct,
    }
}

export function deleteFeatureProductSuccess(IdFeatureProduct) {
    return {
        type: actionsFeatureProduct.DELETE_FEATURE_PRODUCT_SUCCESS,
        payload: IdFeatureProduct,
    }
}

export function deleteFeatureProductFailure(error) {
    return {
        type: actionsFeatureProduct.DELETE_FEATURE_PRODUCT_FAILURE,
        payload: error,
    }
}


//add
export function addFeatureProductRequest(featureProduct) {
    return {
        type: actionsFeatureProduct.ADD_FEATURE_PRODUCT_REQUEST,
        payload: featureProduct,
    }
}

export function addFeatureProductSuccess(featureProduct) {
    return {
        type: actionsFeatureProduct.ADD_FEATURE_PRODUCT_SUCCESS,
        payload: featureProduct,
    }
}

export function addFeatureProductFailure(error) {
    return {
        type: actionsFeatureProduct.ADD_FEATURE_PRODUCT_FAILURE,
        payload: error,
    }
}

