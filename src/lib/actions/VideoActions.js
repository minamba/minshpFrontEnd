export const actionsVideo = {
    GET_VIDEO_REQUEST : "GET_VIDEO_REQUEST",
    GET_VIDEO_SUCCESS : "GET_VIDEO_SUCCESS",
    GET_VIDEO_FAILURE : "GET_VIDEO_FAILURE",

    UPDATE_VIDEO_REQUEST : "UPDATE_VIDEO_REQUEST",
    UPDATE_VIDEO_SUCCESS : "UPDATE_VIDEO_SUCCESS",
    UPDATE_VIDEO_FAILURE : "UPDATE_VIDEO_FAILURE",

    DELETE_VIDEO_REQUEST : "DELETE_VIDEO_REQUEST",
    DELETE_VIDEO_SUCCESS : "DELETE_VIDEO_SUCCESS",
    DELETE_VIDEO_FAILURE : "DELETE_VIDEO_FAILURE",

    ADD_VIDEO_REQUEST : "ADD_VIDEO_REQUEST",
    ADD_VIDEO_SUCCESS : "ADD_VIDEO_SUCCESS",
    ADD_VIDEO_FAILURE : "ADD_VIDEO_FAILURE",
}


//get
export function getVideoRequest() {
    return {
        type: actionsVideo.GET_VIDEO_REQUEST,
    }
}

export function getVideoSuccess(videos) {
    return {
        type: actionsVideo.GET_VIDEO_SUCCESS,
        payload: videos,
    }
}

export function getVideoFailure(error) {
    return {
        type: actionsVideo.GET_VIDEO_FAILURE,
        payload: error,
    }
}


//update
export function updateVideoRequest(video) {
    return {
        type: actionsVideo.UPDATE_VIDEO_REQUEST,
        payload: video,
    }
}

export function updateVideoSuccess(video) {
    return {
        type: actionsVideo.UPDATE_VIDEO_SUCCESS,
        payload: video,
    }
}

export function updateVideoFailure(error) {
    return {
        type: actionsVideo.UPDATE_VIDEO_FAILURE,
        payload: error,
    }
}


//delete
export function deleteVideoRequest(IdVideo) {
    return {
        type: actionsVideo.DELETE_VIDEO_REQUEST,
        payload: IdVideo,
    }
}

export function deleteVideoSuccess(IdVideo) {
    return {
        type: actionsVideo.DELETE_VIDEO_SUCCESS,
        payload: IdVideo,
    }
}

export function deleteVideoFailure(error) {
    return {
        type: actionsVideo.DELETE_VIDEO_FAILURE,
        payload: error,
    }
}


//add
export function addVideoRequest(video) {
    return {
        type: actionsVideo.ADD_VIDEO_REQUEST,
        payload: video,
    }
}

export function addVideoSuccess(video) {
    return {
        type: actionsVideo.ADD_VIDEO_SUCCESS,
        payload: video,
    }
}

export function addVideoFailure(error) {
    return {
        type: actionsVideo.ADD_VIDEO_FAILURE,
        payload: error,
    }
}

