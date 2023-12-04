import { createStore, combineReducers } from "redux";
import LayoutReducer from "./layout/reducer";

const reducer = combineReducers({layout: LayoutReducer,});

const store = createStore(reducer);

export default store;