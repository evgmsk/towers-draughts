import {useCallback, useState} from 'react'

// import { IError } from '../store/app-interface'

interface IFetchProps {
    method: string
    body: any
    headers?: { [key: string]: any }
}

export const useFetch = () => {
    const [requested, setRequested] = useState(false)
    const [message, setMessage] = useState({ message: '' })

    const Fetch = useCallback(async (url: string, props: IFetchProps) => {
        try {
            setRequested(true)
            const res = await window.fetch(url, props)
            const data = await res.json()
            setRequested(false)
            setMessage({ message: data.message || '' })
            return { data, status: res.status }
        } catch (e: any) {
            setRequested(false)
            setMessage({ message: e.message })
            throw e
        }
    }, [])

    return { Fetch, message, requested }
}
