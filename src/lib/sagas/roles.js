import {takeEvery, takeLatest, call, put, fork} from "redux-saga/effects";
import * as actions from "../actions/RoleActions";
import * as api from "../api/roles";


function* getRoles() {
    try {
        const response = yield call (api.getRoles);
        console.log("Roles :",response.data);
        yield put (actions.getRolesSuccess({roles : response.data}));
    }
    catch (error) {
        yield put (actions.getRolesFailure({error : error.response?.data || error.message}));
    }
}



function* watchGetRoles() {
    yield takeLatest(actions.actionsRole.GET_ROLE_REQUEST, getRoles);
}

function* rolesSaga() {
    yield fork(watchGetRoles);
}

export default rolesSaga;