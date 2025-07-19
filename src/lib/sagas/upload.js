import { takeLatest, call, put, fork } from "redux-saga/effects";
import * as actions from "../actions/UploadActions";
import * as api from "../api/upload";

function* postUpload(action) {
    try {
        const response = yield call(api.uploadFile, action.payload);
        yield put(actions.postUploadSuccess(response.data));
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