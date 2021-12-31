import { createStore, combineReducers, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { composeWithDevTools } from 'redux-devtools-extension'

import {InitialState, AppReducers} from './rootState&Reducer';
import sagaRoot from './sagas/sagaRoot';

const sagaMiddleware = createSagaMiddleware();

const storeFactory = (data = InitialState) => {
    const middleware = composeWithDevTools(applyMiddleware(sagaMiddleware));
    const rootReducer = combineReducers(AppReducers)
    const store = createStore(rootReducer, data, middleware)
    sagaMiddleware.run(sagaRoot);
    return store;
};

export default storeFactory;

export type Store = ReturnType<typeof storeFactory>
