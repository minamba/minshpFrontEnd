export const actions = {
    POST_UPLOAD_REQUEST  : "POST_UPLOAD_REQUEST",
    POST_UPLOAD_SUCCESS  : "POST_UPLOAD_SUCCESS",
    POST_UPLOAD_FAILURE  : "POST_UPLOAD_FAILURE",
}

export function postUploadRequest(file) {
    return {
        type: actions.POST_UPLOAD_REQUEST,
        payload: file
    }
}

export function postUploadSuccess(data) {
    return {
        type: actions.POST_UPLOAD_SUCCESS,
        payload: data
    }
}

export function postUploadFailure(error) {
    return {
        type: actions.POST_UPLOAD_FAILURE,
        payload: error
    }
}
