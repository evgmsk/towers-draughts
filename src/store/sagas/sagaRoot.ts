import { all } from 'redux-saga/effects';
import watcherGame from './watcherGame';
// import watcherUser from './watcherUser';
import watcherPreGame from './watcherGamePresets';
import watcherTimer from './watcherTimer';
// import watcherApp from './watcherApp';
import watcherAnalsis from './watcherGameAnalysis'
import watcherBoard from './watcherBoard';

export default function* sagaRoot() {
    yield all([
        watcherPreGame(),
        // watcherUser(),
        watcherGame(),
        watcherTimer(),
        // watcherApp(),
        watcherAnalsis(),
        watcherBoard(),
    ]);
}
