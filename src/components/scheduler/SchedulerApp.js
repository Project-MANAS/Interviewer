/* global gapi */
import React, {Component} from 'react';
import logo from './manas_logo.png';
import './App.css';

import {API_KEY, CLIENT_ID, DISCOVERY_DOCS, SCOPES, SPREADSHEET_ID} from './sensitive_constants';
import ProfileHeader from "./components/ProfileHeader";
import Sittings from "./components/Sittings";
import Sitting from "./components/Sitting";
import BackendlessNotificationPropagator from './scheduler/notification/BackendlessNotificationPropagator';

class SchedulerApp extends Component {
    constructor(props) {
        super(props);

        this.updateSigninStatus = this.updateSigninStatus.bind(this);
        this.state = {rows: null, isSignedin: false};

        this.listMajors = this.listMajors.bind(this);
    }

    // noinspection JSUnusedLocalSymbols
    updateSigninStatus(isSignedin, interviewerProfile) {
        this.setState({isSignedin, interviewerProfile});
    }

    listMajors() {
        gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Scheduler!A13:A',
        }).then(function (response) {
            const range = response.result;
            if (range.values.length > 0) {
                const rows = range.values.map((row) => row);
                this.setState({rows: rows});
            } else {
                console.log('No data found.');
            }
        }.bind(this), function (response) {
            console.log('Error: ' + response.result.error.message);
        });
    }

    render() {
        return (
            <div className="App">
                <div className="App-header">
                    <div className="AppHeaderContainer">
                        <div className="App-Brand">
                            <img style={{display: 'block-inline', float: 'left'}}
                                 src={logo} className="App-logo" alt="logo"/>
                            <h2 style={{display: 'table-cell', color: 'black', padding: '20px'}}>MANAS Scheduler</h2>
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
                            <div>
                                <BackendlessNotificationPropagator/>

                                {
                                    this.state.mySitting ? (
                                        <Sitting interviewerProfile={this.state.interviewerProfile}
                                                 onNotInSitting={() => this.setState({mySitting: null})}/>
                                    ) : (
                                        <Sittings interviewerProfile={this.state.interviewerProfile}
                                                  onAlreadyInSitting={(sitting) => this.setState({mySitting: sitting})}/>
                                    )
                                }
                            </div>
                        ) : (
                            null
                        )
                    }
                </div>
                {
                    this.state.rows &&
                    <ul>
                        {this.state.rows.map((row) => <li key={row}>{row}</li>)}
                    </ul>
                }

            </div>
        );
    }
}

export default SchedulerApp;