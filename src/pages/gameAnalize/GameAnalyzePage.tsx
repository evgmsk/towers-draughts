import React, { Suspense } from 'react'
import {useSelector} from 'react-redux'

import { SideBar } from '../../page-components/Sidebar'
import Spinner from '../../page-components/spinners/Spinner'
import { IRootState } from '../../store/rootState&Reducer'
import AnalysisPageMenu from './AnalysisPageMenu'
import { MovesHistory } from '../../game-components/moves-history/MovesHistory'
import AnalysisBoard from './AnalysisBoard'

import './analyze-page.scss'


export const AnalysisPage: React.FC<{}> = (props) => {
    const portrait = useSelector((state: IRootState) => state.app.portrait)
    const boardSize = useSelector((state: IRootState) => state.boardOptions.boardSize)
    const MainClass = `${portrait ? "portrait" : ""} h${boardSize}v${boardSize}`
    return (
        <Suspense fallback={<Spinner />}>
            <div className={portrait ? "portrait page analyze-page noselect" : "page analyze-page noselect"}>
                <SideBar side="left">
                    <AnalysisPageMenu />
                </SideBar>
                <main className={MainClass}>
                    <AnalysisBoard />
                </main>
                <SideBar side="right">
                    <MovesHistory />
                </SideBar>
            </div>
        </Suspense>
    )
}

export default AnalysisPage
