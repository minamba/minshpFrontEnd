export const actionsImage = {
    GET_IMAGE_REQUEST : "GET_IMAGE_REQUEST",
    GET_IMAGE_SUCCESS : "GET_IMAGE_SUCCESS",
    GET_IMAGE_FAILURE : "GET_IMAGE_FAILURE",

    UPDATE_IMAGE_REQUEST : "UPDATE_IMAGE_REQUEST",
    UPDATE_IMAGE_SUCCESS : "UPDATE_IMAGE_SUCCESS",
    UPDATE_IMAGE_FAILURE : "UPDATE_IMAGE_FAILURE",

    DELETE_IMAGE_REQUEST : "DELETE_IMAGE_REQUEST",
    DELETE_IMAGE_SUCCESS : "DELETE_IMAGE_SUCCESS",
    DELETE_IMAGE_FAILURE : "DELETE_IMAGE_FAILURE",

    ADD_IMAGE_REQUEST : "ADD_IMAGE_REQUEST",
    ADD_IMAGE_SUCCESS : "ADD_IMAGE_SUCCESS",
    ADD_IMAGE_FAILURE : "ADD_IMAGE_FAILURE",
}


//get
export function getImageRequest() {
    return {
        type: actionsImage.GET_IMAGE_REQUEST,
    }
}

export function getImageSuccess(images) {
    return {
        type: actionsImage.GET_IMAGE_SUCCESS,
        payload: images,
    }
}

export function getImageFailure(error) {
    return {
        type: actionsImage.GET_IMAGE_FAILURE,
        payload: error,
    }
}


//update
export function updateImageRequest(image) {
    return {
        type: actionsImage.UPDATE_IMAGE_REQUEST,
        payload: image,
    }
}

export function updateImageSuccess(image) {
    return {
        type: actionsImage.UPDATE_IMAGE_SUCCESS,
        payload: image,
    }
}

export function updateImageFailure(error) {
    return {
        type: actionsImage.UPDATE_IMAGE_FAILURE,
        payload: error,
    }
}


//delete
export function deleteImageRequest(IdImage) {
    return {
        type: actionsImage.DELETE_IMAGE_REQUEST,
        payload: IdImage,
    }
}

export function deleteImageSuccess(IdImage) {
    return {
        type: actionsImage.DELETE_IMAGE_SUCCESS,
        payload: IdImage,
    }
}

export function deleteImageFailure(error) {
    return {
        type: actionsImage.DELETE_IMAGE_FAILURE,
        payload: error,
    }
}


//add
export function addImageRequest(image) {
    return {
        type: actionsImage.ADD_IMAGE_REQUEST,
        payload: image,
    }
}

export function addImageSuccess(image) {
    return {
        type: actionsImage.ADD_IMAGE_SUCCESS,
        payload: image,
    }
}

export function addImageFailure(error) {
    return {
        type: actionsImage.ADD_IMAGE_FAILURE,
        payload: error,
    }
}

