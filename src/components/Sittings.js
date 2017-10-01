import React, {Component} from 'react';
import SessionTimer from "./SessionTimer";
import {appendToSheet, fetchSittings, updateSheet} from "../utils";
import {SHEETS} from "../sensitive_constants";
import moment from "moment";

class Sittings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeDivisionSittings: undefined,
            divisionSittings: undefined,
            statusMsg: "Fetching active " + props.interviewerProfile.division + " sittings..."
        };
        this.joinSession = this.joinSession.bind(this);
        this.refresh = this.refresh.bind(this);
        this.add = this.add.bind(this);
        this.onAddSuccess = this.onAddSuccess.bind(this);
        this.onAddFailure = this.onAddFailure.bind(this);
    }

    componentDidMount() {
        this.refresh();
    }

    joinSession(sessionId) {

    }

    onAddSuccess(response) {
        if (response.result && response.result.updates && response.result.updates.updatedRange) {
            const updatedRange = response.result.updates.updatedRange;
            const rowNumber = updatedRange[updatedRange.length - 1];
            updateSheet(SHEETS.Sittings, "A" + rowNumber, [[rowNumber - 1]]).then(
                function (response) {
                    this.refresh();
                }.bind(this),
                function (response) {
                    this.setState({statusMsg: "Failed to set sitting ID: " + response.result.error.message});
                }.bind(this)
            );
        } else {
            this.setState({
                statusMsg: "There was a problem creating the sittings: " + response.result.error.message
            });
        }
    }

    onAddFailure(response) {
        this.setState({
            statusMsg: "There was a problem creating the sittings: " + response.result.error.message
        });
    }

    add() {
        appendToSheet(
            SHEETS.Sittings, "A:E", [
                [
                    "",
                    this.props.interviewerProfile.division,
                    moment(new Date()).format("MM/DD/YYYY HH:mm:ss"), "",
                    this.props.interviewerProfile.googleProfile.getEmail()
                ]
            ]
        ).then(this.onAddSuccess, this.onAddFailure);
    }

    refresh() {
        this.setState({activeDivisionSittings: undefined});
        fetchSittings(this.props.interviewerProfile,
            (sittings, divisionSittings, activeDivisionSittings, myActiveSitting, errorMessage) => {
                this.setState({
                    divisionSittings,
                    activeDivisionSittings,
                    statusMsg: errorMessage && "There was a problem fetching your division's active sittings:" + errorMessage
                });
                if (myActiveSitting)
                    this.props.onAlreadyInSitting(myActiveSitting);
            });
    }

    render() {
        return (
            <div>
                {
                    this.state.activeDivisionSittings &&
                    <div className="App-Card">
                        <div style={{overflow: "hidden"}}>
                            <h3 style={{float: 'left', display: 'inline-block'}}>
                                Active {this.props.interviewerProfile.division} Sittings</h3>
                            <button style={{float: "right", display: 'inline-block'}} onClick={this.add}>
                                CREATE
                            </button>
                            <button style={{float: "right", display: 'inline-block'}} onClick={this.refresh}>
                                REFRESH
                            </button>
                        </div>
                        <table>
                            <thead>
                            <tr>
                                <th>Interviewers</th>
                                <th>Duration</th>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                this.state.activeDivisionSittings.map(
                                    (sitting) =>
                                        <tr key={sitting.id}>
                                            <td>
                                                {
                                                    sitting.interviewerEmails.map((email) => <tr
                                                        key={email}>{email}</tr>)
                                                }
                                            </td>
                                            <td><SessionTimer startTime={sitting.startTime}
                                                              endTime={sitting.endTime}/>
                                            </td>
                                            <td>
                                                <button onClick={() => this.joinSession(sitting.id)}>Join</button>
                                            </td>
                                        </tr>
                                )
                            }
                            </tbody>
                        </table>
                    </div>
                }
                {
                    this.state.statusMsg &&
                    <p>{this.state.statusMsg}</p>
                }
            </div>
        );
    }
}

export default Sittings;