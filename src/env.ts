export type Mode = 'development' | 'stage' | 'production'
const mode: Mode = process.env.NODE_ENV as Mode
console.log('mode', mode)

export const Config: {[key: string]: any} = { 
    development : {
        // baseURL: 'http://192.168.1.89:5000',
        // wsUrl: 'ws://192.168.1.89:5000/ws',
        baseURL: 'http://0.0.0.0:5000',
        wsUrl: 'ws://localhost:5000/ws',
    },
    production : {
        baseURL: 'http://192.168.1.89:80',
        wsUrl: 'ws://192.168.1.89:80/ws',
    },
    stage : {
        baseURL: 'http://192.168.1.89:80',
        wsUrl: 'ws://192.168.1.89:80/ws',
    }
}

export const env = Config[mode]
