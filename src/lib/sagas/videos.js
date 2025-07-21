import {takeEvery, takeLatest, call, put, fork} from "redux-saga/effects";
import * as actions from "../actions/VideoActions";
import * as api from "../api/videos";



function* getVideos() {
    try {
        const response = yield call (api.getVideos);
        console.log("Videos :",response.data);
        yield put (actions.getVideoSuccess({videos : response.data}));
    }
    catch (error) {
        yield put (actions.getVideoFailure({error : error.response?.data || error.message}));
    }
}

function* addVideo(action) {
    try {
        const response = yield call (api.addVideo, action.payload);
        console.log("Video added :",response.data);
        yield put (actions.addVideoSuccess({video : response.data}));
    }
    catch (error) {
        yield put (actions.addVideoFailure({error : error.response?.data || error.message}));
    }
}

function* updateVideo(action) {
    try {
        const response = yield call (api.updateVideo, action.payload);
        console.log("Video updated :",response.data);
        const videos = yield call (api.getVideos);
        yield put (actions.getVideoSuccess({videos : videos.data}));
    }
    catch (error) {
        yield put (actions.updateVideoFailure({error : error.response?.data || error.message}));
    }
}

function* deleteVideo(action) {
    try {
            yield call(api.deleteVideo, action.payload);
            console.log("Video deleted :",action.payload);
            const response = yield call(api.getVideos);

            yield put (actions.getVideoSuccess({videos : response.data}));
    }
    catch (error) {
        yield put (actions.deleteVideoFailure({error : error.response?.data || error.message}));
    }
}




function* watchGetVideos() {
    yield takeLatest(actions.actionsVideo.GET_VIDEO_REQUEST, getVideos);
}

function* watchAddVideo() {
    yield takeLatest(actions.actionsVideo.ADD_VIDEO_REQUEST, addVideo);
}

function* watchUpdateVideo() {
    yield takeLatest(actions.actionsVideo.UPDATE_VIDEO_REQUEST, updateVideo);
}

function* watchDeleteVideo() {
    yield takeLatest(actions.actionsVideo.DELETE_VIDEO_REQUEST, deleteVideo);
}

function* videosSaga() {
    yield fork(watchGetVideos);
    yield fork(watchAddVideo);
    yield fork(watchUpdateVideo);
    yield fork(watchDeleteVideo);
}

export default videosSaga;

