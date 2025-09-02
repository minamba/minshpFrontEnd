import {takeEvery, takeLatest, call, put, fork} from "redux-saga/effects";
import * as actions from "../actions/PackageProfilActions";
import * as api from "../api/packageProfils";

function* getPackageProfils() {
    try {
        const response = yield call (api.getPackageProfils);
        console.log("PackageProfils :",response.data);
        yield put (actions.getPackageProfilSuccess({packageProfils : response.data}));
    }
    catch (error) {
        yield put (actions.getPackageProfilFailure({error : error.response?.data || error.message}));
    }
}

function* addPackageProfil(action) {
    try {
        const response = yield call (api.addPackageProfil, action.payload);
        console.log("PackageProfil added :",response.data);
        const packageProfils = yield call (api.getPackageProfils);
        yield put (actions.getPackageProfilSuccess({packageProfils : packageProfils.data}));
    }
    catch (error) {
        yield put (actions.addPackageProfilFailure({error : error.response?.data || error.message}));
    }
}

function* updatePackageProfil(action) {
    try {
        const response = yield call (api.updatePackageProfil, action.payload);
        console.log("PackageProfil updated :",response.data);
        const packageProfils = yield call (api.getPackageProfils);
        yield put (actions.getPackageProfilSuccess({packageProfils : packageProfils.data}));
    }
    catch (error) {
        yield put (actions.updatePackageProfilFailure({error : error.response?.data || error.message}));
    }
}

function* deletePackageProfil(action) {
    try {
            yield call(api.deletePackageProfil, action.payload);
            console.log("PackageProfil deleted :",action.payload);
            const response = yield call(api.getPackageProfils);

            yield put (actions.getPackageProfilSuccess({packageProfils : response.data}));
    }
    catch (error) {
        yield put (actions.deletePackageProfilFailure({error : error.response?.data || error.message}));
    }
}


function* watchGetPackageProfils() {
    yield takeLatest(actions.actionsPackageProfil.GET_PACKAGE_PROFIL_REQUEST, getPackageProfils);
    yield takeLatest(actions.actionsPackageProfil.ADD_PACKAGE_PROFIL_REQUEST, addPackageProfil);
    yield takeLatest(actions.actionsPackageProfil.UPDATE_PACKAGE_PROFIL_REQUEST, updatePackageProfil);
    yield takeLatest(actions.actionsPackageProfil.DELETE_PACKAGE_PROFIL_REQUEST, deletePackageProfil);
}

function* packageProfilsSaga() {
    yield fork(watchGetPackageProfils);
}

export default packageProfilsSaga;
