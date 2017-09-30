import React, {Component} from 'react';
import {fetchFromSheet} from "../utils";
import {SHEETS} from "../sensitive_constants";
import SessionTimer from "./SessionTimer";

class Sessions extends Component {
    constructor(props) {
        super(props);
        this.state = {activeDivisionTeams: undefined};
        this.joinSession = this.joinSession.bind(this);
        this.refresh = this.refresh.bind(this);
    }

    componentDidMount() {
        this.refresh();
    }

    joinSession(sessionId) {

    }

    refresh() {
        this.setState({activeDivisionTeams: undefined});
        fetchFromSheet(SHEETS.Session, 'A2:Z')
            .then(function (response) {
                const range = response.result;
                if (range.values && range.values.length > 0) {
                    // const myEmail = this.props.interviewerProfile.googleProfile.getEmail();
                    const myDivision = this.props.interviewerProfile.division;
                    const activeDivisionTeams = range.values
                        .filter((row) => row[1] === myDivision && row[3] === "")
                        .map((row) => {
                            const interviewers = [];
                            for (let i = 4; i < row.length; i++) {
                                row[i] !== "" && interviewers.push(row[i]);
                            }
                            return {
                                id: row[0],
                                startTime: row[2],
                                endTime: row[3],
                                emails: interviewers
                            };
                        });
                    this.setState({activeDivisionTeams})
                }
            }.bind(this), function (response) {
                this.setState({activeDivisionTeams: null, errorMessage: response});
            });
    }

    render() {
        return (
            <div>
                {
                    this.state.activeDivisionTeams ?
                        <table>
                            <tr>
                                <th><h3>Active {this.props.interviewerProfile.division} Sessions</h3></th>
                                <th>
                                    <button onClick={this.refresh}>Refresh</button>
                                </th>
                            </tr>
                            <tr>
                                <th>Interviewers</th>
                                <th>Duration</th>
                            </tr>
                            {
                                this.state.activeDivisionTeams.map(
                                    (team) =>
                                        <tr key={team.id}>
                                            <td>
                                                {
                                                    team.emails.map((email) => <tr key={email}>{email}</tr>)
                                                }
                                            </td>
                                            <td><SessionTimer startTime={new Date(team.startTime)}
                                                              endTime={new Date(team.endTime)}/>
                                            </td>
                                            <td>
                                                <button onClick={() => this.joinSession(team.id)}>Join</button>
                                            </td>
                                        </tr>
                                )
                            }
                        </table>
                        :
                        this.state.errorMessage ?
                            <h5>
                                There was a problem fetching your division's interview teams:
                                {this.state.errorMessage}
                            </h5>
                            :
                            <h5>Fetching your division's active interview teams</h5>
                }
            </div>
        );
    }
}

export default Sessions;