import React, {Component} from 'react';
import logo from './manas_logo.png';
import './App.css';

import {API_KEY, CLIENT_ID, DISCOVERY_DOCS, SCOPES} from './sensitive_constants';
import ProfileHeader from "./components/ProfileHeader";
import InterviewerApp from "./components/interviewer/InterviewerApp";
import {Route, Switch} from "react-router-dom";
import SchedulerApp from "./components/scheduler/SchedulerApp";

const renderMergedProps = (component, ...rest) => {
    const finalProps = Object.assign({}, ...rest);
    return (
        React.createElement(component, finalProps)
    );
};

const PropsRoute = ({component, ...rest}) => {
    return (
        <Route {...rest} render={routeProps => {
            return renderMergedProps(component, routeProps, rest);
        }}/>
    );
};

const PageTitle = (props) => <h2 style={{display: 'table-cell', color: 'black', padding: '20px'}}>{props.title}</h2>;

class App extends Component {
    constructor(props) {
        super(props);

        this.updateSigninStatus = this.updateSigninStatus.bind(this);
        this.state = {isSignedin: false};
    }

    // noinspection JSUnusedLocalSymbols
    updateSigninStatus(isSignedin, interviewerProfile) {
        this.setState({isSignedin, interviewerProfile});
    }

    render() {
        return (
            <div className="App">
                <div className="App-header">
                    <div className="AppHeaderContainer">
                        <div className="App-Brand">
                            <img style={{display: 'block-inline', float: 'left'}}
                                 src={logo} className="App-logo" alt="logo"/>

                            <Switch>
                                <PropsRoute path="/interviewer" component={PageTitle} title="MANAS Interviewer"/>
                                <PropsRoute path="/scheduler" component={PageTitle} title="MANAS Scheduler"/>
                            </Switch>
                        </div>
                        <div style={{float: 'right'}}>
                            <ProfileHeader onSigninStatusChange={this.updateSigninStatus}
                                           apiKey={API_KEY} clientId={CLIENT_ID}
                                           discoveryDocs={DISCOVERY_DOCS} scope={SCOPES}/>
                        </div>
                    </div>
                </div>
                {
                    this.state.isSignedin === true ? (

                        <div className="App-intro">
                            <Switch>
                                <PropsRoute path="/interviewer" component={InterviewerApp}
                                            isSignedIn={this.state.isSignedin}
                                            interviewerProfile={this.state.interviewerProfile}/>
                                <PropsRoute path="/scheduler" component={SchedulerApp}
                                            isSignedIn={this.state.isSignedin}
                                            interviewerProfile={this.state.interviewerProfile}/>
                            </Switch>
                        </div>

                    ) : (
                        null
                    )
                }
            </div>
        );
    }
}

export default App;