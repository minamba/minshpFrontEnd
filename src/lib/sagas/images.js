import {takeEvery, takeLatest, call, put, fork} from "redux-saga/effects";
import * as actions from "../actions/ImageActions";
import * as api from "../api/images";



function* getImages() {
    try {
        const response = yield call (api.getImages);
        console.log("Images :",response.data);
        yield put (actions.getImageSuccess({images : response.data}));
    }
    catch (error) {
        yield put (actions.getImageFailure({error : error.response?.data || error.message}));
    }
}

function* addImage(action) {
    try {
        const response = yield call (api.addImage, action.payload);
        console.log("Image added :",response.data);
        yield put (actions.addImageSuccess({image : response.data}));
    }
    catch (error) {
        yield put (actions.addImageFailure({error : error.response?.data || error.message}));
    }
}

function* updateImage(action) {
    try {
        const response = yield call (api.updateImage, action.payload);
        console.log("Image updated :",response.data);
        const images = yield call (api.getImages);
        yield put (actions.getImageSuccess({images : images.data}));
    }
    catch (error) {
        yield put (actions.updateImageFailure({error : error.response?.data || error.message}));
    }
}

function* deleteImage(action) {
    try {
            yield call(api.deleteImage, action.payload);
            console.log("Image deleted :",action.payload);
            const response = yield call(api.getImages);

            yield put (actions.getImageSuccess({images : response.data}));
    }
    catch (error) {
        yield put (actions.deleteImageFailure({error : error.response?.data || error.message}));
    }
}




function* watchGetImages() {
    yield takeLatest(actions.actionsImage.GET_IMAGE_REQUEST, getImages);
}

function* watchAddImage() {
    yield takeLatest(actions.actionsImage.ADD_IMAGE_REQUEST, addImage);
}

function* watchUpdateImage() {
    yield takeLatest(actions.actionsImage.UPDATE_IMAGE_REQUEST, updateImage);
}

function* watchDeleteImage() {
    yield takeLatest(actions.actionsImage.DELETE_IMAGE_REQUEST, deleteImage);
}

function* imagesSaga() {
    yield fork(watchGetImages);
    yield fork(watchAddImage);
    yield fork(watchUpdateImage);
    yield fork(watchDeleteImage);
}

export default imagesSaga;

