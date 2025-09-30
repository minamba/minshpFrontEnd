// src/lib/reducers/AccountReducers.js
import { actionsAccount } from "../actions/AccountActions";

// Petit helper sûr pour décoder un JWT sans dépendance externe
function decodeJwt(t) {
  try {
    const [, p] = t.split(".");
    return JSON.parse(atob(p.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

// ----- Boot auth: on lit le token AVANT de construire initialState
function bootAuth() {
  try {
    const t = localStorage.getItem("access_token");
    if (!t) return { isAuth: false, user: null };
    const c = decodeJwt(t) || {};
    return {
      isAuth: true,
      user: {
        id: c.sub ?? null,
        name: c.name ?? "",
        email: c.email ?? "",
        roles: Array.isArray(c.role) ? c.role : c.role ? [c.role] : [],
      },
    };
  } catch {
    return { isAuth: false, user: null };
  }
}

const boot = bootAuth();

const initialState = {
  // --- auth ---
  isAuth: boot.isAuth,
  user: boot.user,
  loading: false,
  error: null,

  // --- register ---
  loadingRegister: false,
  errorRegister: null,
  successRegister: false,
  registerData: null,

  // --- update ---
  loadingUpdate: false,
  errorUpdate: null,
  successUpdate: false,

  // --- delete ---
  loadingDelete: false,
  errorDelete: null,
  successDelete: false,

  // --- update password ---
  loadingUpdatePassword: false,
  errorUpdatePassword: null,
  successUpdatePassword: false,

  // --- add role ---
  loadingAddRole: false,
  errorAddRole: null,
  successAddRole: false,

  // --- delete role ---
  loadingDeleteRole: false,
  errorDeleteRole: null,
  successDeleteRole: false,

  // --- lock ---
  loadingLock: false,
  errorLock: null,
  successLock: false,

  // --- unlock ---
  loadingUnlock: false,
  errorUnlock: null,
  successUnlock: false,
};

export default function AccountReducer(state = initialState, action) {
  switch (action.type) {

    //LOGIN
    case actionsAccount.LOGIN_SUCCESS:
      return { ...state, isAuth: true, user: action.payload.user, error: null };

    case actionsAccount.LOGIN_FAILURE:
      return { ...state, loading: false, error: action.payload.error || "Échec de connexion" };

    case actionsAccount.LOGOUT:
      localStorage.removeItem("access_token");
      localStorage.removeItem("remember_email");
      return { ...state, isAuth: false, user: null };


    //REGISTER
    case actionsAccount.REGISTER_REQUEST:
      return { ...state, loadingRegister: true, errorRegister: null, successRegister: false };
    case actionsAccount.REGISTER_SUCCESS:
      return { ...state, loadingRegister: false, successRegister: true, registerData: action.payload };
    case actionsAccount.REGISTER_FAILURE:
      return { ...state, loadingRegister: false, errorRegister: action.payload.error || "Échec de l'inscription" };

    case actionsAccount.UPDATE_USER_REQUEST:
      return { ...state, loadingUpdate: true, errorUpdate: null, successUpdate: false };
    case actionsAccount.UPDATE_USER_SUCCESS:
      return { ...state, loadingUpdate: false, successUpdate: true };
    case actionsAccount.UPDATE_USER_FAILURE:
      return { ...state, loadingUpdate: false, errorUpdate: action.payload.error || "Échec de la mise à jour" };

      case actionsAccount.UPDATE_USER_RESET:
        return { 
          ...state, 
          successUpdate: false, 
          errorUpdate: null, 
          loadingUpdate: false 
        };

    //DELETE
    case actionsAccount.DELETE_USER_SUCCESS:
      return { ...state, loadingDelete: false, successDelete: true };
    case actionsAccount.DELETE_USER_FAILURE:
      return { ...state, loadingDelete: false, errorDelete: action.payload.error || "Échec de la suppression" };

      

    //UPDATE PASSWORD
    case actionsAccount.UPDATE_USER_PASSWORD_REQUEST:
      return { ...state, loadingUpdatePassword: true, errorUpdatePassword: null, successUpdatePassword: false };
    case actionsAccount.UPDATE_USER_PASSWORD_SUCCESS:
      return { ...state, loadingUpdatePassword: false, successUpdatePassword: true };
    case actionsAccount.UPDATE_USER_PASSWORD_FAILURE:
      return { ...state, loadingUpdatePassword: false, errorUpdatePassword: action.payload.error || "Échec de la mise à jour" };

      case actionsAccount.UPDATE_USER_PASSWORD_RESET:
        return { 
          ...state, 
          successUpdatePassword: false, 
          errorUpdatePassword: null, 
          loadingUpdatePassword: false 
        };



        //ROLES
        case actionsAccount.ADD_USER_ROLE_REQUEST:
            return { ...state, loadingAddRole: true, errorAddRole: null, successAddRole: false };
        case actionsAccount.ADD_USER_ROLE_SUCCESS:
            return { ...state, loadingAddRole: false, successAddRole: true };
        case actionsAccount.ADD_USER_ROLE_FAILURE:
            return { ...state, loadingAddRole: false, errorAddRole: action.payload.error || "Échec de l'ajout du role" };

        case actionsAccount.REMOVE_USER_ROLE_SUCCESS:
            return { ...state, loadingRemoveRole: false, successRemoveRole: true };
        case actionsAccount.REMOVE_USER_ROLE_FAILURE:
            return { ...state, loadingRemoveRole: false, errorRemoveRole: action.payload.error || "Échec de la suppression du role" };

        
        //LOCK
        case actionsAccount.LOCK_USER_REQUEST:
            return { ...state, loadingLock: true, errorLock: null, successLock: false };
        case actionsAccount.LOCK_USER_SUCCESS:
            return { ...state, loadingLock: false, successLock: true };
        case actionsAccount.LOCK_USER_FAILURE:
            return { ...state, loadingLock: false, errorLock: action.payload.error || "Échec de la verrouillage" };

        //UNLOCK
        case actionsAccount.UNLOCK_USER_REQUEST:
            return { ...state, loadingUnlock: true, errorUnlock: null, successUnlock: false };
        case actionsAccount.UNLOCK_USER_SUCCESS:
            return { ...state, loadingUnlock: false, successUnlock: true };
        case actionsAccount.UNLOCK_USER_FAILURE:
            return { ...state, loadingUnlock: false, errorUnlock: action.payload.error || "Échec de la déverrouillage" };

    default:
      return state;
  }
}
