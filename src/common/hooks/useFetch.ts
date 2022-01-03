import {useCallback, useState} from 'react'

// import { IError } from '../store/app-interface'

interface IFetchProps {method: string, body: any, headers?: {[key: string]: any}}

export const useFetch = () => {
    const [requested, setRequested] = useState(false)
    const [message, setMesssage] = useState({message: ''})
   
    const  Fetch = useCallback( async (url, props) => {
        try {
            setRequested(true)
            const res = await window.fetch(url, props)
            const data = await res.json()
            setRequested(false)
            setMesssage({message: data.message || ''})
            return {data, status: res.status}
        } catch(e: any) {
            setRequested(false)
            setMesssage({message: e.message})
            throw e
        }
    }, [])

    return {Fetch, message, requested}
}
