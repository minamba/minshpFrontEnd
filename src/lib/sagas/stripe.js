import {takeEvery, takeLatest, call, put, fork} from "redux-saga/effects";
import * as actions from "../actions/StripeActions";
import * as api from "../api/stripe";
import { loadStripe } from "@stripe/stripe-js";


function* createCheckoutSession(action) {
    try {
      const response = yield call(api.createCheckoutSession, action.payload);
      console.log("Stripe session created:", response.data);
  
      const { sessionId, publishableKey } = response.data || {};
      if (!sessionId || !publishableKey) {
        throw new Error("Réponse Stripe invalide: sessionId/publishableKey manquants");
      }
  
      const stripe = yield call(loadStripe, publishableKey);
      const { error } = yield call([stripe, stripe.redirectToCheckout], { sessionId });
      if (error) throw error;
  
      yield put(actions.createCheckoutSessionSuccess(response.data));
    } catch (error) {
      console.error("Stripe error:", error);
      yield put(
        actions.createCheckoutSessionFailure({
          error: error?.response?.data || error.message,
        })
      );
    }
  }
  
  /**
   * Confirme la session après redirection de Stripe (page /success).
   * action.sessionId attendu : string
   * Le backend vérifie le paiement et crée commande + expédition.
   */
  function* confirmCheckout(action) {
    try {
      const response = yield call(api.confirmCheckout, action.payload);
      console.log("Stripe confirm result:", response.data);
  
      yield put(actions.confirmCheckoutSessionSuccess(response.data));
    } catch (error) {
      console.error("Stripe error:", error.message);
      yield put(
        actions.confirmCheckoutSessionFailure({
          error: error?.response?.data || error.message,
        })
      );
    }
  }
  
  /* ==================== WATCHERS ==================== */
  
  function* watchCreateCheckoutSession() {
    yield takeLatest(
      actions.actionsStripe.CREATE_CHECKOUT_SESSION_REQUEST,
      createCheckoutSession
    );
  }
  
  function* watchConfirmCheckout() {
    yield takeLatest(
      actions.actionsStripe.CONFIRM_CHECKOUT_REQUEST,
      confirmCheckout
    );
  }
  
  /* ==================== ROOT SAGA ==================== */
  
  function* stripeSaga() {
    yield fork(watchCreateCheckoutSession);
    yield fork(watchConfirmCheckout);
  }
  
  export default stripeSaga;