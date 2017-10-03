/* global gapi */
import React, {Component} from 'react';
import {DIVISIONS, SHEETS} from "../../sensitive_constants";
import {appendToSheet, fetchFromSheet} from "../../utils";


class InterviewerSignIn extends Component {
    constructor(props) {
        super(props);
        this.state = {status: '', selectedDivision: DIVISIONS[0], interviewerDivision: undefined};
        this.register = this.register.bind(this);
        this.fetchCredentials = this.fetchCredentials.bind(this);
        this.onMySigninStatusChange = this.onMySigninStatusChange.bind(this);

        this.googleProfile = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
        this.props = props;
    }

    componentDidMount() {
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
                    'Error fetching interviewer credentials: ' + JSON.stringify(response));
            });
    }

    register() {
        const registerDivision = this.state.selectedDivision;
        appendToSheet(SHEETS.Interviewers, 'A2:C2', [
            [this.googleProfile.getName(), this.googleProfile.getEmail(), registerDivision]
        ]).then(
            function (response) {
                if (response.statusMsg === 200 && response.result.updates.updatedCells === 3) {
                    this.onMySigninStatusChange(registerDivision);
                } else {
                    this.onMySigninStatusChange(null, 'Failed to signup');
                }
            }.bind(this),
            function (response) {
                if (response.statusMsg === 403) {
                    this.onMySigninStatusChange(null, 'Authentication failure: ' +
                        'Make sure you have member level access to the MANAS Drive');
                } else {
                    this.onMySigninStatusChange(null, 'Failed to signup: ' + JSON.stringify(response));
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
                    <div>
                        <p>Looks like you've not registered as an interviewer yet</p>
                        <div>
                            <p style={{display: 'inline-block'}}>Select your division:</p>
                            <select style={{display: 'inline-block'}}
                                    onChange={(event) => {
                                        this.setState({selectedDivision: event.target.value})
                                    }}>
                                {DIVISIONS.map((division => <option key={division} value={division}>
                                    {division}</option>))}
                            </select>
                            <button style={{display: 'inline-block'}} className='login'
                                    onClick={this.register}>Register
                            </button>
                        </div>
                        <p>{this.state.statusMsg}</p>
                    </div>
                );
                break;
            default:
                result = null;
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