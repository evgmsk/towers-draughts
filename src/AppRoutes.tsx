import React, { lazy, Suspense } from 'react'
import {Switch, Route} from 'react-router-dom'

import Home from './pages/home/Home'
import Spinner from './page-components/spinners/Spinner'
import {RoutesPath} from './constants/gameConstants'


const GameAnalizePage =  lazy(() => import( './pages/gameAnalize/GameAnalyzePage'));
const GamePage = lazy(() => import( './pages/game/GamePage'));

const Router = () => {
    return (
        <Suspense fallback={<Spinner />}>
            <Switch>
               <Route path={RoutesPath.home} exact>
                    <Home />
                </Route>
                <Route path={RoutesPath.game}>
                    <GamePage />
                </Route>
                <Route path={RoutesPath.analysis}>
                    <GameAnalizePage />
                </Route>               
            </Switch>
        </Suspense> 
    )    
}

export default React.memo(Router)
