import React, {Component} from 'react';
import '../../App.css';
import BackendlessNotificationPropagator from "./notification/BackendlessNotificationPropagator";

class SchedulerApp extends Component {
    render() {
        return (
            <div>
                <BackendlessNotificationPropagator/>
                <h1>Scheduler App</h1>
            </div>
        );
    }
}

export default SchedulerApp;