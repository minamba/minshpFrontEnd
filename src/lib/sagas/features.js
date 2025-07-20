import {takeEvery, takeLatest, call, put, fork} from "redux-saga/effects";
import * as actions from "../actions/FeatureActions";
import * as api from "../api/features";



function* getFeatures() {
    try {
        const response = yield call (api.getFeatures);
        console.log("Features :",response.data);
        yield put (actions.getFeatureSuccess({features : response.data}));
    }
    catch (error) {
        yield put (actions.getFeatureFailure({error : error.response?.data || error.message}));
    }
}

function* addFeature(action) {
    try {
        const response = yield call (api.addFeature, action.payload);
        console.log("Feature added :",response.data);
        const features = yield call (api.getFeatures);
        yield put (actions.getFeatureSuccess({features : features.data}));
    }
    catch (error) {
        yield put (actions.addFeatureFailure({error : error.response?.data || error.message}));
    }
}


function* updateFeature(action) {
    try {
        const response = yield call (api.updateFeature, action.payload);
        console.log("Feature updated :",response.data);
        const features = yield call (api.getFeatures);
        yield put (actions.getFeatureSuccess({features : features.data}));
    }
    catch (error) {
        yield put (actions.updateFeatureFailure({error : error.response?.data || error.message}));
    }
}

function* deleteFeature(action) {
    try {
            yield call(api.deleteFeature, action.payload);
            const response = yield call(api.getFeatures);

            yield put (actions.getFeatureSuccess({features : response.data}));
    }
    catch (error) {
        yield put (actions.deleteFeatureFailure({error : error.response?.data || error.message}));
    }
}




function* watchGetFeatures() {
    yield takeLatest(actions.actionsFeature.GET_FEATURE_REQUEST, getFeatures);
}

function* watchAddFeature() {
    yield takeLatest(actions.actionsFeature.ADD_FEATURE_REQUEST, addFeature);
}

function* watchUpdateFeature() {
    yield takeLatest(actions.actionsFeature.UPDATE_FEATURE_REQUEST, updateFeature);
}

function* watchDeleteFeature() {
    yield takeLatest(actions.actionsFeature.DELETE_FEATURE_REQUEST, deleteFeature);
}

function* featuresSaga() {
    yield fork(watchGetFeatures);
    yield fork(watchAddFeature);
    yield fork(watchUpdateFeature);
    yield fork(watchDeleteFeature);
}

export default featuresSaga;

