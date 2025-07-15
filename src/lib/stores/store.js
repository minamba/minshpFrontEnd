import {createStore, applyMiddleware} from "redux";
import reducers from "../reducers/index";
import createSagaMiddleware from "redux-saga";
import rootSaga from "../sagas/index";
import axios from "axios";


axios.defaults.withCredentials = false;
//axios.defaults.baseURL = "http://minshp.com";
axios.defaults.baseURL = "https://localhost:7057";

//creation du middleware
const sageMiddleware = createSagaMiddleware();

//creation du store
const store = createStore(reducers, applyMiddleware(sageMiddleware));

//démarrage du middleware
sageMiddleware.run(rootSaga);

export default store;
