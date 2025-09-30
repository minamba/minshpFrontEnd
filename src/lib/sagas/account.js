import {takeEvery, takeLatest, call, put, fork} from "redux-saga/effects";
import * as actions from "../actions/AccountActions";
import * as actionsCustomers from "../actions/CustomerActions";
import * as actionsNewsletters from "../actions/NewLetterActions";
import * as api from "../api/account";
import * as apiCustomers from "../api/customers";
import * as apiNewsletters from "../api/newLetter";
import { getCustomerRequest } from "../actions/CustomerActions";
import { decodeJwt } from "../utils/jwt";

function parseAuthError(err) {
    return "Identifiants invalides";
  }


  // saga account
function problemToText(err) {
    const d = err?.response?.data;
    if (d?.error === "invalid_grant") {
      return "Identifiants invalides";
    }
    if (!d) return err?.message || "Erreur inattendue";
    if (typeof d === "string") return d;
    if (d.errors) {
      // ModelState : { field: ["msg1","msg2"], ... }
      return Object.values(d.errors).flat().join(" ");
    }
    if (d.title) return d.title; // ProblemDetails.title
    return JSON.stringify(d);
  }


  //login
function* login(action) {
    try {
        const { email, password, remember, navigate } = action.payload;
        const response = yield call (api.login, { email, password });
        const token = response.data?.access_token;

        if (!token) throw new Error("No token returned");

        if (remember) localStorage.setItem("remember_email", email);
        else localStorage.removeItem("remember_email");

        localStorage.setItem("access_token", token);

        const claims = decodeJwt(token) || {};
        const user = {
          id: claims.sub || null,
          name: claims.name || "",
          email: claims.email || "",
          roles: Array.isArray(claims.role) ? claims.role : (claims.role ? [claims.role] : []),
        };


        console.log("Login :",response.data);
        yield put (actions.loginSuccess({response : response.data, user}));

        if (navigate) navigate("/"); // redirection Home

    }
    catch (error) {
      // On essaie d'identifier proprement le cas "compte bloqué"
      const res   = error?.response;         // axios
      const data  = res?.data;
      const code  = res?.status ?? error?.status; // fetch fallback
    
      let msg = "Impossible de se connecter pour le moment.";
    
      // Cas OpenIddict (password grant): 400 invalid_grant
      if (code === 400 && data?.error === "invalid_grant") {
        const desc = String(data?.error_description || "").toLowerCase();
        if (desc.includes("account_locked") || desc.includes("bloqué") || desc.includes("locked")) {
          msg = "Votre compte est bloqué. Réessayez plus tard ou contactez le support";
        } else {
          msg = "Email ou mot de passe incorrect.";
        }
      }
      // Cas éventuel de ton endpoint /account/login : 423 Locked
      else if (code === 423) {
        const desc = String(data?.message || data?.error_description || "").trim();
        msg = desc || "Votre compte est bloqué. Réessayez plus tard.";
      }
      // Fallback générique existant
      else {
        msg = problemToText?.(error) || msg;
      }
    
      yield put(actions.loginFailure({ error: msg }));
    }

}

//register
function* Register(action) {
    try {
      const {
        Civility, FirstName, LastName, Email,Birthdate, Password, Phone,
        navigate,
      } = action.payload;
  
      const payload = {
        Civility,
        FirstName,
        LastName,
        Email,
        Password,
        Phone: Phone || null,
        // Birthdate si ton API l’accepte (sinon retire-le)
        Birthdate: Birthdate || null,
      };
  
      // 1) création du compte
      const res = yield call(api.register, payload); // 201 Created
      yield put(actions.registerSuccess(res.data));
  
      // 2) auto‑login (facultatif)
      const tokenRes = yield call(api.passwordToken, { Email, Password });
      const token = tokenRes?.data?.access_token;
      if (token) {
        localStorage.setItem("access_token", token);
        yield put(actions.loginSuccess({ response: tokenRes.data }));
      }

      const customers = yield call (apiCustomers.getCustomers);
      yield put (actionsCustomers.getCustomerSuccess({customers : customers.data}));

  
      // 3) navigation
      if (navigate) navigate("/", { replace: true }); // ou navigate("/login")
  
    } catch (err) {
        yield put(actions.registerFailure({ error: problemToText(err) }));
    }
  }

  //update
  function* Update(action) {
    try {
      const res = yield call(api.updateUser, action.payload);
      yield put(actions.updateUserSuccess(res.data));
      yield put(getCustomerRequest());
              const response = yield call (apiNewsletters.getNewsletters);
              console.log("Newsletters :",response.data);
              yield put (actionsNewsletters.getNewsletterSuccess({newsletters : response.data}));
    } catch (err) {
      yield put(actions.updateUserFailure({ error: problemToText(err) }));
    }
  }


  
    //delete
    function* Delete(action) {
      try {
        const res = yield call(api.deleteUser, action.payload);
        yield put(actions.deleteUserSuccess(res.data));
        yield put(getCustomerRequest());
      } catch (err) {
        yield put(actions.deleteUserFailure({ error: problemToText(err) }));
      }
    }

    //update password
    function* UpdatePassword(action) {
      try {
        const res = yield call(api.updateUserPassword, action.payload);
        yield put(actions.updateUserPasswordSuccess(res.data));
        yield put(getCustomerRequest());
      } catch (err) {
        yield put(actions.updateUserPasswordFailure({ error: problemToText(err) }));
      }
    }

    //Add role
    function* AddRole(action) {
      try {
        const res = yield call(api.addUserRole, action.payload);
        yield put(actions.addRoleSuccess(res.data));
        yield put(getCustomerRequest());
      } catch (err) {
        console.log(err);
        yield put(actions.addRoleFailure({ error: problemToText(err) }));
      }
    }

    //Remove role
    function* RemoveRole(action) {
      try {
        const res = yield call(api.removeUserRole, action.payload);
        yield put(actions.removeRoleSuccess(res.data));
        yield put(getCustomerRequest());
      } catch (err) {
        yield put(actions.removeRoleFailure({ error: problemToText(err) }));
      }
    }


    //Lock User
    function* LockUser(action) {
      try {
        const res = yield call(api.lockUser, action.payload);
        yield put(actions.lockUserSuccess(res.data));
        // yield put(getCustomerRequest());
        const response = yield call (apiCustomers.getCustomers);
        yield put (actionsCustomers.getCustomerSuccess({customers : response.data}));
      } catch (err) {
        yield put(actions.lockUserFailure({ error: problemToText(err) }));
      }
    }

    //Unlock User
    function* UnlockUser(action) {
      try {
        const res = yield call(api.unlockUser, action.payload);
        yield put(actions.unlockUserSuccess(res.data));
        yield put(getCustomerRequest());
      } catch (err) {
        yield put(actions.unlockUserFailure({ error: problemToText(err) }));
      }
    }


    function* watchAccount() {
        yield takeLatest(actions.actionsAccount.LOGIN_REQUEST, login);
        yield takeLatest(actions.actionsAccount.REGISTER_REQUEST, Register);
        yield takeLatest(actions.actionsAccount.UPDATE_USER_REQUEST, Update);
        yield takeLatest(actions.actionsAccount.DELETE_USER_REQUEST, Delete);
        yield takeLatest(actions.actionsAccount.UPDATE_USER_PASSWORD_REQUEST, UpdatePassword);
        yield takeLatest(actions.actionsAccount.ADD_USER_ROLE_REQUEST, AddRole);
        yield takeLatest(actions.actionsAccount.REMOVE_USER_ROLE_REQUEST, RemoveRole);
        yield takeLatest(actions.actionsAccount.LOCK_USER_REQUEST, LockUser);
        yield takeLatest(actions.actionsAccount.UNLOCK_USER_REQUEST, UnlockUser);
    }

    function* accountSaga() {
        yield fork(watchAccount);
    }






    export default accountSaga;

