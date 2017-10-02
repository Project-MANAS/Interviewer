import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import registerServiceWorker from './registerServiceWorker';

import {BrowserRouter, Route} from 'react-router-dom';
import App from "./App";


ReactDOM.render(
    <BrowserRouter>
        <Route path="/" component={App}/>
    </BrowserRouter>
    ,
    document.getElementById('root')
);
registerServiceWorker();
