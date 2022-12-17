import React from 'react'
import { createRoot } from 'react-dom/client'

import { Provider } from 'react-redux'
import storeFactory from './store'
import { InitialState } from './store/rootState&Reducer'
import { UserActions } from './store/user/types'
// import {GameActions} from './store/game/types';
// import {wsOnError, wsOnMessage} from './web-sockets/ws'
// import {errorHandler} from './web-sockets/event-handlers/ws-error-handler'
// import {messageHandler} from './web-sockets/event-handlers/ws-message-handler'
import './assets/scss/style.scss'
import { AppActions } from './store/app/types'
import App from './App'
import reportWebVitals from './reportWebVitals'

const store = storeFactory(InitialState)

// wsOnError(errorHandler, store)

// wsOnMessage(messageHandler, store)

const root = createRoot(document.getElementById('root')!)
root.render(
    <Provider store={store}>
        <React.StrictMode>
            <App />
        </React.StrictMode>
    </Provider>
)

reportWebVitals()

store.dispatch({ type: UserActions.CHECK_STORAGE })

if (window) {
    const payload = window.innerWidth / window.innerHeight < 1.3
    store.dispatch({ type: AppActions.SET_PORTRAIT, payload })
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
