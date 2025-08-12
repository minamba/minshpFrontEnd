import { takeLatest, call, put, fork } from "redux-saga/effects";
import * as actions from "../actions/UploadActions";
import * as actionsImg from "../actions/ImageActions";
import * as actionsVideo from "../actions/VideoActions";
import * as api from "../api/upload";
import * as apiImg from "../api/images";
import * as apiVideo from "../api/videos";



function* postUpload(action) {
    try {
        const response = yield call(api.uploadFile, action.payload);
        console.log("File uploaded :",response.data);
        const images = yield call (apiImg.getImages);
        const videos = yield call (apiVideo.getVideos);
        yield put (actionsImg.getImageSuccess({images : images.data}));
        yield put (actionsVideo.getVideoSuccess({videos : videos.data}));
    } catch (error) {
        yield put(actions.postUploadFailure(error));
    }
}


function* watchPostUploadRequest() {
    yield takeLatest(actions.actions.POST_UPLOAD_REQUEST, postUpload);
}


function* uploadSaga() {
    yield fork(watchPostUploadRequest);
}

export default uploadSaga;