export const actionsFeature = {
    GET_FEATURE_REQUEST : "GET_FEATURE_REQUEST",
    GET_FEATURE_SUCCESS : "GET_FEATURE_SUCCESS",
    GET_FEATURE_FAILURE : "GET_FEATURE_FAILURE",

    UPDATE_FEATURE_REQUEST : "UPDATE_FEATURE_REQUEST",
    UPDATE_FEATURE_SUCCESS : "UPDATE_FEATURE_SUCCESS",
    UPDATE_FEATURE_FAILURE : "UPDATE_FEATURE_FAILURE",

    DELETE_FEATURE_REQUEST : "DELETE_FEATURE_REQUEST",
    DELETE_FEATURE_SUCCESS : "DELETE_FEATURE_SUCCESS",
    DELETE_FEATURE_FAILURE : "DELETE_FEATURE_FAILURE",

    ADD_FEATURE_REQUEST : "ADD_FEATURE_REQUEST",
    ADD_FEATURE_SUCCESS : "ADD_FEATURE_SUCCESS",
    ADD_FEATURE_FAILURE : "ADD_FEATURE_FAILURE",
}


//get
export function getFeatureRequest() {
    return {
        type: actionsFeature.GET_FEATURE_REQUEST,
    }
}

export function getFeatureSuccess(features) {
    return {
        type: actionsFeature.GET_FEATURE_SUCCESS,
        payload: features,
    }
}

export function getFeatureFailure(error) {
    return {
        type: actionsFeature.GET_FEATURE_FAILURE,
        payload: error,
    }
}


//update
export function updateFeatureRequest(feature) {
    return {
        type: actionsFeature.UPDATE_FEATURE_REQUEST,
        payload: feature,
    }
}

export function updateFeatureSuccess(feature) {
    return {
        type: actionsFeature.UPDATE_FEATURE_SUCCESS,
        payload: feature,
    }
}

export function updateFeatureFailure(error) {
    return {
        type: actionsFeature.UPDATE_FEATURE_FAILURE,
        payload: error,
    }
}


//delete
export function deleteFeatureRequest(IdFeature) {
    return {
        type: actionsFeature.DELETE_FEATURE_REQUEST,
        payload: IdFeature,
    }
}

export function deleteFeatureSuccess(IdFeature) {
    return {
        type: actionsFeature.DELETE_FEATURE_SUCCESS,
        payload: IdFeature,
    }
}

export function deleteFeatureFailure(error) {
    return {
        type: actionsFeature.DELETE_FEATURE_FAILURE,
        payload: error,
    }
}


//add
export function addFeatureRequest(feature) {
    return {
        type: actionsFeature.ADD_FEATURE_REQUEST,
        payload: feature,
    }
}

export function addFeatureSuccess(feature) {
    return {
        type: actionsFeature.ADD_FEATURE_SUCCESS,
        payload: feature,
    }
}

export function addFeatureFailure(error) {
    return {
        type: actionsFeature.ADD_FEATURE_FAILURE,
        payload: error,
    }
}

