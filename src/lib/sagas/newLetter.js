import {takeEvery, takeLatest, call, put, fork} from "redux-saga/effects";
import * as actions from "../actions/NewLetterActions";
import * as api from "../api/newLetter";


function* getNewsletters() {
    try {
        const response = yield call (api.getNewsletters);
        console.log("Newsletters :",response.data);
        yield put (actions.getNewsletterSuccess({newsletters : response.data}));
    }
    catch (error) {
        yield put (actions.getNewsletterFailure({error : error.response?.data || error.message}));
    }
}

function* addNewsletter(action) {
    try {
      const response = yield call(api.addNewsletter, action.payload);
  
      // extrait un texte utilisable (au cas où response.data soit un objet)
      const raw = response?.data;
      const msg =
        typeof raw === "string"
          ? raw
          : raw?.message ?? raw?.Message ?? "Ajout réussi";
  
      // ton action creator attend payload: { successMessage }
      yield put(actions.addNewsletterSuccess(msg));
      const newsletters = yield call (api.getNewsletters);
      yield put (actions.getNewsletterSuccess({newsletters : newsletters.data}));
    } catch (error) {

      let raw = error?.response?.data? error?.response?.data : error.message;
     
      if(error.response.status === 401){
        raw = "Vous devez être connecté pour vous abonner à la newsletter";
      }

      const errMsg =
        typeof raw === "string"
          ? raw
          : raw?.message ?? raw?.Message ?? error.message ?? "Ajout échoué";
  
      // ton action creator attend payload: { errorMessage, error }
      yield put(actions.addNewsletterFailure(errMsg, true));
    }
  }

function* updateNewsletter(action) {
    try {
        const response = yield call (api.updateNewsletter, action.payload);
        console.log("Newsletter updated :",response.data);
        const newsletters = yield call (api.getNewsletters);
        yield put (actions.getNewsletterSuccess({newsletters : newsletters.data}));
    }
    catch (error) {
        yield put (actions.updateNewsletterFailure({error : error.response?.data || error.message}));
    }
}

function* deleteNewsletter(action) {
    try {
            yield call(api.deleteNewsletter, action.payload);
            console.log("Newsletter deleted :",action.payload);
            const response = yield call(api.getNewsletters);

            yield put (actions.getNewsletterSuccess({newsletters : response.data}));
    }
    catch (error) {
        yield put (actions.deleteNewsletterFailure({error : error.response?.data || error.message}));
    }
}




function* watchGetNewsletters() {
    yield takeLatest(actions.actionsNewLetter.GET_NEWSLETTER_REQUEST, getNewsletters);
}

function* watchAddNewsletter() {
    yield takeLatest(actions.actionsNewLetter.ADD_NEWSLETTER_REQUEST, addNewsletter);
}

function* watchUpdateNewsletter() {
    yield takeLatest(actions.actionsNewLetter.UPDATE_NEWSLETTER_REQUEST, updateNewsletter);
}

function* watchDeleteNewsletter() {
    yield takeLatest(actions.actionsNewLetter.DELETE_NEWSLETTER_REQUEST, deleteNewsletter);
}

function* newLetterSaga() {
    yield fork(watchGetNewsletters);
    yield fork(watchAddNewsletter);
    yield fork(watchUpdateNewsletter);
    yield fork(watchDeleteNewsletter);
}

export default newLetterSaga;

