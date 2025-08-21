import {takeEvery, takeLatest, call, put, fork} from "redux-saga/effects";
import * as actions from "../actions/LoginActions";
import * as api from "../api/login";


function parseAuthError(err) {
    return "Identifiants invalides";
  }


function* login(action) {
    try {
        const { email, password, remember, navigate } = action.payload;
        const response = yield call (api.login, { email, password });
        const token = response.data?.access_token;

        if (!token) throw new Error("No token returned");

        if (remember) localStorage.setItem("remember_email", email);
        else localStorage.removeItem("remember_email");

        localStorage.setItem("access_token", token);
        console.log("Login :",response.data);
        yield put (actions.loginSuccess({response : response.data}));

        if (navigate) navigate("/"); // redirection Home

    }
    catch (error) {
        yield put(actions.loginFailure({ error: parseAuthError(error) })); // 👈 string
    }

}

    function* watchLogin() {
        yield takeLatest(actions.actionsLogin.LOGIN_REQUEST, login);
    }

    function* loginSaga() {
        yield fork(watchLogin);
    }




    export default loginSaga;

