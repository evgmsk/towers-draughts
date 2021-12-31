import {useState, useCallback, useEffect} from 'react'

import './showMessage.scss'

export const useMessageShow = (animationLimit = 4000) => {
    const [message, setMessage] = useState({msg: '', ok: true} as {msg: string, ok: boolean})
    const [popUp, setPopUp] = useState(null as unknown as HTMLElement) 

    function createPopUp ():HTMLElement {
        const popUpElement = document.getElementById('show-message-popup')
        if (!popUpElement) {
            const popUpTemplate = ` <div class="show-message-popup_container">
                                        <p id="show-message-popup" class="show-message-popup"><p>
                                    </div>`
            const root = document.getElementById("root")
            root?.insertAdjacentHTML("afterbegin", popUpTemplate)
            const popUp = document.getElementById('show-message-popup') as HTMLElement
            // console.log(popUp)
            return popUp
        }
        // console.log(popUpElement)
        return popUpElement
    }

    const showMessage = (props: {msg: string, ok: boolean}) => {
        setMessage(props)
    }

    const displayShowUp = useCallback(() => {
        popUp!.innerText = message.msg
        const classToAdd = `${message.ok ? 's' : 'error-sh-pop'}`
        popUp.parentElement?.classList.add('display')
        popUp.classList.add(classToAdd)
    }, [message.msg, message.ok, popUp])

    const animateShowUp = useCallback(() => {
        popUp?.classList.add('animate-sh-pop')
    },[popUp?.classList])

    const showUp = useCallback(() => {
        if(!message.msg) return
        displayShowUp()
        animateShowUp()
    }, [animateShowUp, displayShowUp, message.msg])

  
    useEffect(() => {
        setPopUp(createPopUp())
    }, [])
    
    useEffect(() => {
        if (!popUp) return
        const finishShowUp = () => {
            popUp.parentElement?.classList.remove('display')
            popUp.setAttribute('class', 'show-message-popup')
            setMessage({msg: '', ok: true})
        }
        popUp.addEventListener('animationend', finishShowUp)
        return () => {
            popUp.removeEventListener('animationend', finishShowUp)
        }
    }, [popUp])

    useEffect(() => {
        showUp()
    }, [message.msg, showUp])
        
    return {showMessage, message, showUp}
}