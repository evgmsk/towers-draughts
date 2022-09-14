import React, { Suspense } from 'react'

import Spinner from '../../page-components/spinners/Spinner'
import gameExample from '../../assets/game-example.gif'
import BGBoard from './Bg-board'
import { sampleLink } from '../../constants/gameConstants'
import {I18n} from '../../assets/i18n'

import './home.scss'
import { useSelector } from 'react-redux'
import { IRootState } from '../../store/rootState&Reducer'
import { useHistory } from 'react-router-dom'

export const Home: React.FC = () => {
    const language = useSelector((store: IRootState) => store.user.language)
    const history = useHistory()
    const i18n = (I18n as {[key: string]: any})[language.slice(0, 2)]
    const href = sampleLink
    const handleClick = () => {
        history.push("game")
    }
    return (
        <Suspense fallback={<Spinner />}>
            <div className="page home-page">
                <BGBoard />
                <section className="home-page_content">
                    <span>{i18n.about}</span>
                        <figure className="game-example-wrapper">
                            <a href={href} target="_blank" rel="author noreferrer">
                                <figcaption><p>Tower's draughts game example.</p><p>Created by Sergey Ivanov.</p></figcaption>
                                <img width="200px" src={gameExample} alt="Tower's Checkers game example"></img>
                            </a>   
                        </figure>
                    <span>&nbsp;{i18n.about_continue}</span>
                    <p className="home-page_to-game_button">
                        <button className='new-game' onClick={handleClick} type="button">{i18n.play}</button>
                    </p>
                </section>
            </div>
        </Suspense>
    )
}
    
export default Home
