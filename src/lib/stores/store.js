//VERSION DU STORE A SANS LAUTHENTIFICATION OPENIDDICT

// import {createStore, applyMiddleware} from "redux";
// import reducers from "../reducers/index";
// import createSagaMiddleware from "redux-saga";
// import rootSaga from "../sagas/index";
// import axios from "axios";


// axios.defaults.withCredentials = false;
// //axios.defaults.baseURL = "http://minshp.com";
// axios.defaults.baseURL = "https://localhost:7057";
// //axios.defaults.baseURL = "https://bd158b87393d.ngrok.app:7057";

// //creation du middleware
// const sageMiddleware = createSagaMiddleware();

// //creation du store
// const store = createStore(reducers, applyMiddleware(sageMiddleware));

// //démarrage du middleware
// sageMiddleware.run(rootSaga);

// export default store;

//VERSION DU STORE A AVEC LAUTHENTIFICATION OPENIDDICT
import { createStore, applyMiddleware, combineReducers } from "redux";
import createSagaMiddleware from "redux-saga";
import rootSaga from "../sagas";
import reducers from "../reducers/index";
import axios from "axios";

// 1) Crée TON instance axios ici
// axios.defaults.withCredentials = false;
// axios.defaults.baseURL = "https://localhost:7057";
// axios.defaults.timeout = 15000;

// utilise l'hôte de la barre d'adresse (localhost sur PC, IP sur mobile)
const API_HOST = window.location.hostname;     // ex: "localhost" ou "192.168.1.63"
const API_PORT = 5054;                         // ton port API HTTP
axios.defaults.baseURL = `http://${API_HOST}:${API_PORT}`;
//axios.defaults.baseURL = "https://minshp.com";
axios.defaults.withCredentials = false;
axios.defaults.timeout = 15000;

// 2) Interceptors (token + 401)
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axios.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("access_token");
      // Option: window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// 3) Crée le saga middleware en injectant http dans le context
const sagaMiddleware = createSagaMiddleware({
  context: { axios },
});

//creation du store
const store = createStore(reducers, applyMiddleware(sagaMiddleware));

sagaMiddleware.run(rootSaga);

export default store;
