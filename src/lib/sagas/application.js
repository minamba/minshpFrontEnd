import {takeEvery, takeLatest, call, put, fork} from "redux-saga/effects";
import * as actions from "../actions/ApplicationActions";
import * as api from "../api/applications";



function* getApplications() {
    try {
        const response = yield call (api.getApplication);
        console.log("Applications :",response.data);
        yield put (actions.getApplicationSuccess({applications : response.data}));
    }
    catch (error) {
        yield put (actions.getApplicationFailure({error : error.response?.data || error.message}));
    }
}

function* addApplication(action) {
    try {
        const response = yield call (api.addApplication, action.payload);
        console.log("Application added :",response.data);
        const applications = yield call (api.getApplication);
        yield put (actions.getApplicationSuccess({applications : applications.data}));
    }
    catch (error) {
        yield put (actions.addApplicationFailure({error : error.response?.data || error.message}));
    }
}

function* updateApplication(action) {
    try {
        const response = yield call (api.updateApplication, action.payload);
        console.log("Application updated :",response.data);
        const applications = yield call (api.getApplication);
        yield put (actions.getApplicationSuccess({applications : applications.data}));
    }
    catch (error) {
        yield put (actions.updateApplicationFailure({error : error.response?.data || error.message}));
    }
}

function* deleteApplication(action) {
    try {
            yield call(api.deleteApplication, action.payload);
            console.log("Application deleted :",action.payload);
            const response = yield call(api.getApplication);

            yield put (actions.getApplicationSuccess({applications : response.data}));
    }
    catch (error) {
        yield put (actions.deleteApplicationFailure({error : error.response?.data || error.message}));
    }
}




function* watchGetApplications() {
    yield takeLatest(actions.actionsApplication.GET_APPLICATION_REQUEST, getApplications);
}

function* watchAddApplication() {
    yield takeLatest(actions.actionsApplication.ADD_APPLICATION_REQUEST, addApplication);
}

function* watchUpdateApplication() {
    yield takeLatest(actions.actionsApplication.UPDATE_APPLICATION_REQUEST, updateApplication);
}

function* watchDeleteApplication() {
    yield takeLatest(actions.actionsApplication.DELETE_APPLICATION_REQUEST, deleteApplication);
}

function* applicationSaga() {
    yield fork(watchGetApplications);
    yield fork(watchAddApplication);
    yield fork(watchUpdateApplication);
    yield fork(watchDeleteApplication);
}

export default applicationSaga;

