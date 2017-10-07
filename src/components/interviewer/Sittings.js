import React, {Component} from 'react';
import SessionTimer from "../SessionTimer";
import {appendToSheet, googleDateFormat, updateSheet} from "../../utils";
import {SHEETS} from "../../sensitive_constants";
import {fetchSittings} from "./utils";

class Sittings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeDivisionSittings: undefined,
            divisionSittings: undefined,
            statusMsg: "Fetching active " + props.interviewerProfile.division + " sittings..."
        };
        this.joinSitting = this.joinSitting.bind(this);
        this.refresh = this.refresh.bind(this);
        this.createSitting = this.createSitting.bind(this);
        this.onAddSuccess = this.onAddSuccess.bind(this);
        this.onAddFailure = this.onAddFailure.bind(this);
    }

    componentDidMount() {
        this.refresh();
    }

    joinSitting(sitting) {
        const rowIndex = parseInt(sitting.id, 10) + 1;
        const interviewerEmailsBaseIndex = 4;
        const colIndex = parseInt(interviewerEmailsBaseIndex + sitting.interviewerEmails.length, 10);
        updateSheet(
            SHEETS.Sittings,
            String.fromCharCode("A".charCodeAt(0) + colIndex) + rowIndex,
            [[this.props.interviewerProfile.googleProfile.getEmail()]]
        ).then(
            function (response) {
                this.refresh();
            }.bind(this),
            function (response) {
                this.setState({statusMsg: 'Failed join sitting: ' + response.result.error.message});
            }.bind(this)
        );
    }

    onAddSuccess(response) {
        if (response.result && response.result.updates && response.result.updates.updatedRange) {
            const updatedRange = response.result.updates.updatedRange;
            const rowNumber = updatedRange.split(":")[1].substr(1);
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

    createSitting() {
        appendToSheet(
            SHEETS.Sittings, "A:E", [
                [
                    "",
                    this.props.interviewerProfile.division,
                    googleDateFormat(new Date()), "",
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
                    statusMsg: errorMessage && "There was a problem fetching your division's active sittings:" +
                    errorMessage.result.error.message
                });
                if (myActiveSitting)
                    this.props.onAlreadyInSitting(myActiveSitting);
            });
    }

    render() {
        return (
            <div>
                <h3>Sittings</h3>
                {
                    <div className="App-Card">
                        <div style={{overflow: "hidden"}}>
                            <h3 style={{float: 'left', display: 'inline-block'}}>
                                Active {this.props.interviewerProfile.division} Sittings</h3>
                            <button style={{float: "right", display: 'inline-block'}} onClick={this.createSitting}>
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
                                this.state.activeDivisionSittings && this.state.activeDivisionSittings.map(
                                    (sitting) =>
                                        <tr key={sitting.id}>
                                            <td>
                                                <ol>
                                                    {
                                                        sitting.interviewerEmails.map((email) => <li
                                                            key={email}>{email}</li>)
                                                    }
                                                </ol>
                                            </td>
                                            <td><SessionTimer startTime={sitting.startTime}
                                                              endTime={sitting.endTime}/>
                                            </td>
                                            <td>
                                                <button onClick={() => this.joinSitting(sitting)}>Join</button>
                                            </td>
                                        </tr>
                                )
                            }
                            </tbody>
                        </table>
                        {
                            this.state.statusMsg &&
                            <p>{this.state.statusMsg}</p>
                        }
                    </div>
                }
            </div>
        );
    }
}

export default Sittings;