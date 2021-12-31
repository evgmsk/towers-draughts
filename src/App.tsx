import React from 'react';
import {BrowserRouter as Router} from 'react-router-dom'

import RouterComponent from './AppRoutes';
import { Header } from './page-components/Header';
import Footer from './page-components/Footer';



import './App.scss'

const App: React.FC  = () => {

    return (
        <Router> 
            <Header />
                <RouterComponent />
            <Footer />
        </Router>   
    );
}

export default App;
