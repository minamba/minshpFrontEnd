export const actionsFeatureCategory = {
    GET_FEATURE_CATEGORY_REQUEST : "GET_FEATURE_CATEGORY_REQUEST",
    GET_FEATURE_CATEGORY_SUCCESS : "GET_FEATURE_CATEGORY_SUCCESS",
    GET_FEATURE_CATEGORY_FAILURE : "GET_FEATURE_CATEGORY_FAILURE",

    GET_FEATURE_CATEGORY_BY_PRODUCT_REQUEST : "GET_FEATURE_CATEGORY_BY_PRODUCT_REQUEST",
    GET_FEATURE_CATEGORY_BY_PRODUCT_SUCCESS : "GET_FEATURE_CATEGORY_BY_PRODUCT_SUCCESS",
    GET_FEATURE_CATEGORY_BY_PRODUCT_FAILURE : "GET_FEATURE_CATEGORY_BY_PRODUCT_FAILURE",

    UPDATE_FEATURE_CATEGORY_REQUEST : "UPDATE_FEATURE_CATEGORY_REQUEST",
    UPDATE_FEATURE_CATEGORY_SUCCESS : "UPDATE_FEATURE_CATEGORY_SUCCESS",
    UPDATE_FEATURE_CATEGORY_FAILURE : "UPDATE_FEATURE_CATEGORY_FAILURE",

    DELETE_FEATURE_CATEGORY_REQUEST : "DELETE_FEATURE_CATEGORY_REQUEST",
    DELETE_FEATURE_CATEGORY_SUCCESS : "DELETE_FEATURE_CATEGORY_SUCCESS",
    DELETE_FEATURE_CATEGORY_FAILURE : "DELETE_FEATURE_CATEGORY_FAILURE",

    ADD_FEATURE_CATEGORY_REQUEST : "ADD_FEATURE_CATEGORY_REQUEST",
    ADD_FEATURE_CATEGORY_SUCCESS : "ADD_FEATURE_CATEGORY_SUCCESS",
    ADD_FEATURE_CATEGORY_FAILURE : "ADD_FEATURE_CATEGORY_FAILURE",
}


//get
export function getFeatureCategoryRequest() {
    return {
        type: actionsFeatureCategory.GET_FEATURE_CATEGORY_REQUEST,
    }
}

export function getFeatureCategorySuccess(featureCategories) {
    return {
        type: actionsFeatureCategory.GET_FEATURE_CATEGORY_SUCCESS,
        payload: featureCategories,
    }
}

export function getFeatureCategoryFailure(error) {
    return {
        type: actionsFeatureCategory.GET_FEATURE_CATEGORY_FAILURE,
        payload: error,
    }
}



//get by product
export function getFeaturesCategoryByProductRequest(idProduct) {
    return {
        type: actionsFeatureCategory.GET_FEATURE_CATEGORY_BY_PRODUCT_REQUEST,
        payload: idProduct,
    }
}

export function getFeatureCategoryByProductSuccess(featuresCategoryByProduct) {
    return {
        type: actionsFeatureCategory.GET_FEATURE_CATEGORY_BY_PRODUCT_SUCCESS,
        payload: featuresCategoryByProduct,
    }
}

export function getFeatureCategoryByProductFailure(error) {
    return {
        type: actionsFeatureCategory.GET_FEATURE_CATEGORY_BY_PRODUCT_FAILURE,
        payload: error,
    }
}

//update
export function updateFeatureCategoryRequest(featureCategory) {
    return {
        type: actionsFeatureCategory.UPDATE_FEATURE_CATEGORY_REQUEST,
        payload: featureCategory,
    }
}

export function updateFeatureCategorySuccess(featureCategory) {
    return {
        type: actionsFeatureCategory.UPDATE_FEATURE_CATEGORY_SUCCESS,
        payload: featureCategory,
    }
}

export function updateFeatureCategoryFailure(error) {
    return {
        type: actionsFeatureCategory.UPDATE_FEATURE_CATEGORY_FAILURE,
        payload: error,
    }
}


//delete
export function deleteFeatureCategoryRequest(IdFeatureCategory) {
    return {
        type: actionsFeatureCategory.DELETE_FEATURE_CATEGORY_REQUEST,
        payload: IdFeatureCategory,
    }
}

export function deleteFeatureCategorySuccess(IdFeatureCategory) {
    return {
        type: actionsFeatureCategory.DELETE_FEATURE_CATEGORY_SUCCESS,
        payload: IdFeatureCategory,
    }
}

export function deleteFeatureCategoryFailure(error) {
    return {
        type: actionsFeatureCategory.DELETE_FEATURE_CATEGORY_FAILURE,
        payload: error,
    }
}


//add
export function addFeatureCategoryRequest(featureCategory) {
    return {
        type: actionsFeatureCategory.ADD_FEATURE_CATEGORY_REQUEST,
        payload: featureCategory,
    }
}

export function addFeatureCategorySuccess(featureCategory) {
    return {
        type: actionsFeatureCategory.ADD_FEATURE_CATEGORY_SUCCESS,
        payload: featureCategory,
    }
}

export function addFeatureCategoryFailure(error) {
    return {
        type: actionsFeatureCategory.ADD_FEATURE_CATEGORY_FAILURE,
        payload: error,
    }
}

