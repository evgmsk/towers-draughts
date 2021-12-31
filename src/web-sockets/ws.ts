import {env} from '../env'
import { Store } from '../store';

interface Message {
  [key: string]: any
}

export const ws = new WebSocket(env.wsUrl);


export const sendMessage = (message: Message) => {
  if (ws.readyState === 1) {
    ws.send(JSON.stringify(message))
  } else {
    ws.onopen = () => {
      console.log('connected')
      ws.send(JSON.stringify(message))
    }
  }
}

export const wsOnMessage = (cb: Function, store: Store) => {
  ws.onmessage =  (event: any) => {
    cb(event.data, store)
  }
}

export const wsOnError = (cb: Function, store: Store) => {
  ws.onerror = e => {
    cb(e, store)
  }
}
