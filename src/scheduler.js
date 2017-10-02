import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import SchedulerApp from "./components/scheduler/SchedulerApp";
import registerServiceWorker from './registerServiceWorker';


ReactDOM.render(<SchedulerApp/>, document.getElementById('root'));
registerServiceWorker();
