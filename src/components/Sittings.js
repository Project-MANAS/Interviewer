import React, {Component} from 'react';
import SessionTimer from "./SessionTimer";
import {fetchSittings} from "../utils";

class Sittings extends Component {
    constructor(props) {
        super(props);
        this.state = {activeDivisionSittings: undefined, divisionSittings: undefined, errorMessage: undefined};
        this.joinSession = this.joinSession.bind(this);
        this.refresh = this.refresh.bind(this);
    }

    componentDidMount() {
        this.refresh();
    }

    joinSession(sessionId) {

    }

    refresh() {
        this.setState({activeDivisionSittings: undefined});
        fetchSittings(this.props.interviewerProfile,
            (sittings, divisionSittings, activeDivisionSittings, myActiveSitting, errorMessage) => {
                this.setState({divisionSittings, activeDivisionSittings, errorMessage});
                if (myActiveSitting)
                    this.props.onAlreadyInSitting(myActiveSitting);
            });
    }

    render() {
        return (
            <div>
                {
                    this.state.divisionSittings ?
                        <table>
                            <thead>
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
                            </thead>
                            <tbody>
                            {
                                this.state.divisionSittings.map(
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
                        :
                        this.state.errorMessage ?
                            <p>
                                There was a problem fetching your division's active sittings:
                                {this.state.errorMessage}
                            </p>
                            :
                            <p>Fetching your division's active sittings</p>
                }
            </div>
        );
    }
}

export default Sittings;