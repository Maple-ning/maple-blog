import storage from "redux-persist/lib/storage";
import loginSlice from "./loginSlice";
import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import { persistStore, persistReducer } from "redux-persist";

import thunk from "redux-thunk";

const reducers = combineReducers({
  login:loginSlice,
});

const persistConfig = {
  key: "root",
  storage,
  whiteList: ["login"]
};

const persistReducerN = persistReducer(persistConfig,reducers);

const store = configureStore({
  reducer:persistReducerN,
  middleware:[thunk],
});

export const persistor = persistStore(store);

export default store;