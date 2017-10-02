import React, {Component} from 'react';
import logo from './manas_logo.png';
import './App.css';

import {API_KEY, CLIENT_ID, DISCOVERY_DOCS, SCOPES} from './sensitive_constants';
import ProfileHeader from "./components/ProfileHeader";
import InterviewerApp from "./components/interviewer/InterviewerApp";

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
                            <h2 style={{display: 'table-cell', color: 'black', padding: '20px'}}>MANAS Interviewer</h2>
                        </div>
                        <div style={{float: 'right'}}>
                            <ProfileHeader onSigninStatusChange={this.updateSigninStatus}
                                           apiKey={API_KEY} clientId={CLIENT_ID}
                                           discoveryDocs={DISCOVERY_DOCS} scope={SCOPES}/>
                        </div>
                    </div>
                </div>
                <div className="App-intro">
                    {
                        this.state.isSignedin === true ? (
                            <InterviewerApp isSignedIn={this.state.isSignedin}
                                            interviewerProfile={this.state.interviewerProfile}/>
                        ) : (
                            null
                        )
                    }
                </div>
            </div>
        );
    }
}

export default App;