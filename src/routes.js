import React from 'react';
import {IndexRoute, Route} from 'react-router';
/**
 * Import all page components here
 */
import App from './App';
import MainPage from './components/scheduler/SchedulerApp';
import SomePage from './components/interviewer/InterviewerApp';
import SomeOtherPage from './components/SomeOtherPage';

/**
 * All routes go here.
 * Don't forget to import the components above after adding new route.
 */
export default (
    <Route path="/" component={App}>
        <IndexRoute component={MainPage}/>
        <Route path="/some/where" component={SomePage}/>
        <Route path="/some/otherpage" component={SomeOtherPage}/>
    </Route>
);