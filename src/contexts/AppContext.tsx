import React, {createContext, useState, useEffect, useCallback} from 'react'

import { Storage } from '../constants/gameConstants'
import {IUser } from '../store/app-interface'

interface IGameContext {
    soundVolume: number;
    changeSoundVolume?(s: number): void;
    saveUser(user: IUser): void;
    user: IUser;
    lang: string;
    setLang(l: string): void;
    firstTime: boolean;
}
// const defaultUser:IUser = {userId: 'esf', token: 'sef', userSurname: 'sef'}
const CreateDefaultContext = ():IGameContext => {
    
    const defaultContext: IGameContext = {
        soundVolume: 5,
        changeSoundVolume: (s: number) => {},
        user: {} as IUser,
        saveUser: (u: IUser) => {},
        lang: navigator.language.slice(0,2)  ||  'ru',
        setLang: (l: string) => {},
        firstTime: !!localStorage.getItem(Storage)
    }
    return defaultContext
}
const AppContextDefaultValues: IGameContext = CreateDefaultContext() as IGameContext

export const AppContext = createContext<IGameContext>(
    AppContextDefaultValues
)

export const AppProvider = ({children}: {children?: React.ReactNode}) => {
    const [soundVolume, setSoundVolume] = useState(5)
    const [user, setUser] = useState({} as IUser)
    const [lang, setLanguage] = useState(navigator.language.slice(0,2))
    const [firstTime, setFirstTime] = useState(!!localStorage.getItem(Storage) as boolean);
    const [value, setValue] = useState(CreateDefaultContext())
    
    const saveUser = useCallback((user: IUser) => {
        console.log(user)
        setUser(user)
    }, [])
    const changeSoundVolume = (s: number) => {
        setSoundVolume(s)
    }
    const setLang = (l: string) => {
        setLanguage(l)
    }
    // const Value={ soundVolume, changeSoundVolume, saveUser, user, lang, setLang, firstTime }

    useEffect(() => {
        setValue({
            saveUser,
            firstTime,
            lang,
            setLang,
            changeSoundVolume,
            soundVolume,
            user
        })
    }, [firstTime, lang, soundVolume, user])
    return (
        <AppContext.Provider value={value} >
            {children}
        </AppContext.Provider>
    )
}
