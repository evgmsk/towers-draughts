/* eslint-disable react-hooks/rules-of-hooks */
import {useState, useCallback, useEffect} from 'react'

// import {Storage} from '../constants/gameConstants'
// // import { GameContext } from '../contexts/AppContext'
// import { IUser } from '../store/app-interface'

// interface IStorage {
//     login(gwt: string | null, id: string | null, nickname: string | null): void,
//     logout(): void,
//     log: boolean,
//     storedUser: IUser
// }
// const defUser = {token: null, userId: null, nickname: null} as IUser
// export const useStorage = ():IStorage => {
//     const [sUser, setSUser] = useState(defUser)
//     const [log, setLog] = useState(!!sUser.nickname)
  
//     const login = useCallback((jwt, id, name) => {
//         setLog(true)
//         setSUser({token: jwt, userId: id, nickname: name})
//         console.log(log)
//         localStorage.setItem(Storage, JSON.stringify({token: jwt, userId: id, nickname: name}))
//     }, [])

//     const logout = useCallback(() => {
//         console.log('logout before', Storage, sUser)
//         setLog(false)
//         setSUser(defUser)
//         localStorage.removeItem(Storage)
//         console.log('logout', Storage)
//         localStorage.setItem(Storage, JSON.stringify(defUser))
//     }, [sUser])
   
//     useEffect(() => {
//         const data = JSON.parse(localStorage.getItem(Storage)!)
//         if (data && (data.token)) {
//             console.log('local', data.nickname)
//             const {token, userId, nickname} = data
//             setSUser({token, userId, nickname})
//             setLog(true)
//         }
//     }, [])
    
//     return {login, logout, storedUser: sUser, log}
// }

export const f = 5