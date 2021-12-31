import React, { Suspense } from 'react'

import { SideBar } from '../../page-components/Sidebar'
import Spinner from '../../page-components/spinners/Spinner'
import gameExample from '../../assets/game-example.gif'
import { sampleLink } from '../../constants/gameConstants'
import {I18n} from '../../assets/i18n'

import './home.scss'
import { useSelector } from 'react-redux'
import { IRootState } from '../../store/rootState&Reducer'

export const Home: React.FC = () => {
    const language = useSelector((store: IRootState) => store.user.language)
    const internalization = (I18n as {[key: string]: any})[language.slice(0, 2)]
    const href = sampleLink
    return (
        <Suspense fallback={<Spinner />}>
            <div className="page home-page">
                <SideBar side="left">
                </SideBar>
                <section className="home-content">
                    <figure className="game-example-wrapper">
                        <a href={href} target="_blank" rel="author noreferrer">
                            <figcaption>Tower's draughts game example. Created by Sergey Ivanov 1958</figcaption>
                            <img width="200px" src={gameExample} alt="Tower's Checkers game example"></img>
                        </a>   
                    </figure>
                    <div className="home-invitation">{internalization.about}</div>
                </section>
                <SideBar side="right">
                </SideBar>
            </div>
        </Suspense>
    )

}
    
export default Home
