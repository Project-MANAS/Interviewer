/* global gapi */
import React, {Component} from 'react';
import {DIVISIONS, SHEETS} from "../sensitive_constants";
import {appendToSheet, fetchFromSheet} from "../utils";


class InterviewerSignIn extends Component {
    constructor(props) {
        super(props);
        this.state = {status: '', selectedDivision: DIVISIONS[0], interviewerDivision: undefined};
        this.register = this.register.bind(this);
        this.fetchCredentials = this.fetchCredentials.bind(this);
        this.onMySigninStatusChange = this.onMySigninStatusChange.bind(this);

        this.googleProfile = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
        this.props = props;
        this.onMySigninStatusChange();
        this.fetchCredentials();
    }

    onMySigninStatusChange(myDivision, errorMessage) {
        this.setState({interviewerDivision: myDivision, status: errorMessage});
        this.props.onSigninStatusChange(
            myDivision !== undefined && myDivision !== null,
            {
                division: myDivision,
                googleProfile: this.googleProfile
            }
        );
    }

    fetchCredentials() {
        fetchFromSheet(SHEETS.Interviewers, 'A2:C')
            .then(function (response) {
                const myCred = [this.googleProfile.getName(), this.googleProfile.getEmail()];
                const range = response.result;
                let myDivision = null;
                if (range.values && range.values.length > 0) {
                    range.values.some((row) => {
                        const isMe = row[0] === myCred[0] && row[1] === myCred[1];
                        if (isMe) {
                            myDivision = row[2];
                        }
                        return isMe;
                    });
                }
                this.onMySigninStatusChange(myDivision);
            }.bind(this), function (response) {
                this.onMySigninStatusChange(null,
                    'Error fetching interviewer credentials: ' + response.result.error.message);
            });
    }

    register() {
        const registerDivision = this.state.selectedDivision;
        appendToSheet(SHEETS.Interviewers, 'A2:C2', [
            [this.googleProfile.getName(), this.googleProfile.getEmail(), registerDivision]
        ]).then(
            function (response) {
                if (response.status === 200 && response.result.updates.updatedCells === 3) {
                    this.onMySigninStatusChange(registerDivision);
                } else {
                    this.onMySigninStatusChange(null, 'Failed to signup');
                }
            }.bind(this),
            function (response) {
                if (response.status === 403) {
                    this.onMySigninStatusChange(null, 'Authentication failure: ' +
                        'Make sure you have member level access to the MANAS Drive');
                } else {
                    this.onMySigninStatusChange(null, 'Failed to signup: ' + response.result.error.message);
                }
            }.bind(this)
        );
    }

    render() {
        let result = null;
        switch (this.state.interviewerDivision) {
            case undefined:
                result = <p style={{color: 'grey'}}>Fetching interviewer credentials...</p>;
                break;
            case null:
                result = (
                    <tr>
                        <tr>
                            <tr>
                                Looks like you've not registered as an interviewer yet
                            </tr>
                            <tr>
                                <p style={{display: 'inline-block', margin: '8px'}}>Select your division:</p>
                                <select style={{display: 'inline-block', margin: '8px'}}
                                        onChange={(event) => {
                                            this.setState({selectedDivision: event.target.value})
                                        }}>
                                    {DIVISIONS.map((division => <option key={division} value={division}>
                                        {division}</option>))}
                                </select>
                                <button style={{display: 'inline-block', margin: '12px'}} className='login'
                                        onClick={this.register}>Register
                                </button>
                            </tr>
                            <tr>
                                {this.state.status}
                            </tr>
                        </tr>
                    </tr>
                );
                break;
        }
        return (
            <table>
                {
                    result
                }
            </table>
        );
    }
}

export default InterviewerSignIn;