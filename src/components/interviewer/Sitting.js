import React, {Component} from 'react';
import SessionTimer from "../SessionTimer";
import {googleDateFormat, updateSheet} from "../../utils";
import {SHEETS} from "../../sensitive_constants";
import IntervieweeSchedule from "./IntervieweeSchedule";
import {fetchInterviews, fetchSchedules, fetchSittings} from "./utils";

class Sitting extends Component {
    constructor(props) {
        super(props);
        this.refresh = this.refresh.bind(this);
        this.endSitting = this.endSitting.bind(this);
        this.onStartInterview = this.onStartInterview.bind(this);
        this.state = {divisionSchedules: undefined};
    }

    componentDidMount() {
        this.refresh();
    }

    onStartInterview(schedule) {
        this.props.onStartInterview && this.props.onStartInterview(schedule)
    }

    refresh() {
        fetchSittings(this.props.interviewerProfile,
            (sittings, divisionSittings, activeDivisionSittings, myActiveSitting, errorResponse) => {
                this.setState({
                    divisionSittings,
                    activeDivisionSittings,
                    mySitting: myActiveSitting,
                    statusMsg: errorResponse && errorResponse.result.error.message
                });
                if (!errorResponse && myActiveSitting === null) {
                    this.props.onNotInSitting();
                } else {
                    fetchSchedules().catch(
                        function (error) {
                            this.setState({
                                schedules: undefined,
                                divisionSchedules: undefined,
                                errorMessage: "Failed to fetch schedules: " + JSON.stringify(error)
                            })
                        }.bind(this)
                    ).then(
                        function (schedules) {
                            this.setState({
                                schedules,
                                divisionSchedules: undefined,
                                interviews: undefined,
                                errorMessage: null
                            });
                            const myDivision = this.state.mySitting.division;
                            const myDivisionSchedules = schedules.filter(
                                (schedule) => myDivision === schedule.pref1.division || myDivision === schedule.pref2.division
                            );
                            if (myDivisionSchedules.length === 0) {
                                throw new Error("No interviews scheduled for your division");
                            } else {
                                return myDivisionSchedules;
                            }
                        }.bind(this)
                    ).catch(
                        function (error) {
                            this.setState({
                                divisionSchedules: null,
                                errorMessage: "Failed to get your division's schedules: " + JSON.stringify(error)
                            });
                        }.bind(this)
                    ).then(
                        function (myDivisionSchedules) {
                            this.setState({
                                divisionSchedules: myDivisionSchedules,
                                interviews: undefined,
                                errorMessage: null
                            });
                            return fetchInterviews()
                        }.bind(this)
                    ).catch(
                        function (error) {
                            this.setState({
                                interviews: null,
                                divisionInterviews: null,
                                errorMessage: "Failed to fetch interviews: " + JSON.stringify(error),
                            });
                        }.bind(this)
                    ).then(
                        function (interviews) {
                            this.setState({
                                interviews: interviews,
                                errorMessage: null
                            });
                            const myDivision = this.props.interviewerProfile.division;
                            const divisionSittingIds = this.state.divisionSittings
                                .filter((sitting) => myDivision === sitting.division)
                                .map((sitting) => sitting.id);
                            const myDivisionInterviews = interviews.filter(
                                (interview) => divisionSittingIds.some((id) => id === interview.sittingId)
                            );
                            const mySittingId = this.state.mySitting.id;
                            const myActiveInterviews = myDivisionInterviews.filter(
                                (interview) => mySittingId === interview.sittingId && interview.endTime === null
                            );
                            if (myActiveInterviews.length >= 1) {
                                return myActiveInterviews[0];
                            } else {
                                throw new Error("No active interview");
                            }
                        }.bind(this)
                    ).catch(
                        function (error) {
                            //Do nothing
                        }
                    ).then(function (myActiveInterview) {
                        this.onStartInterview(myActiveInterview);
                    }.bind(this));
                }
            });
    }

    endSitting() {
        const rowIndex = parseInt(this.state.mySitting.id, 10) + 1;
        updateSheet(SHEETS.Sittings, "D" + rowIndex, [[googleDateFormat(new Date())]])
            .then(
                function (response) {
                    this.refresh();
                }.bind(this),
                function (response) {
                    this.setState({errorMessage: 'Failed to end sitting: ' + response.result.error.message});
                }.bind(this)
            );
    }

    render() {
        return (<div>
                <h3>Sitting</h3>
                {
                    this.state.mySitting ?
                        (
                            <div>
                                <div className='App-Card'>
                                    <p style={{display: 'inline-block', float: 'left'}}>
                                        Sitting ID: {this.state.mySitting.id}
                                    </p>
                                    <div style={{display: 'inline-block', float: 'right'}}>
                                        <p style={{display: 'inline-block'}}>
                                            Session Duration:
                                        </p>
                                        <SessionTimer style={{display: 'inline-block'}}
                                                      startTime={this.state.mySitting.startTime}
                                                      endTime={this.state.mySitting.endTime}/>
                                        <button style={{display: 'inline-block'}} onClick={this.refresh}>
                                            REFRESH
                                        </button>
                                        <button style={{display: 'inline-block'}} onClick={this.endSitting}>
                                            END SITTING
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    < div className='App-Card' style={{display: 'inline-block', float: 'left'}}>
                                        <h5>Interviewers</h5>
                                        <ol>
                                            {
                                                this.state.mySitting.interviewerEmails.map((email) => <li
                                                    key={email}>{email}</li>)
                                            }
                                        </ol>
                                    </div>
                                    <div className='App-Card' style={{display: 'inline-block', float: 'right'}}>
                                        <h5>Interviewees</h5>
                                        <table style={{fontSize: '10px'}}>
                                            <thead>
                                            <tr>
                                                <th/>
                                                <th/>
                                                <th/>
                                                <th>Preference 1</th>
                                                <th/>
                                                <th/>
                                                <th>Preference 2</th>
                                                <th/>
                                                <th/>
                                            </tr>
                                            <tr>
                                                <th>Registration</th>
                                                <th>Name</th>
                                                <th>Division</th>
                                                <th>Slot</th>
                                                <th>Status</th>
                                                <th>Division</th>
                                                <th>Slot</th>
                                                <th>Status</th>
                                                <th/>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {
                                                this.state.divisionSchedules && this.state.divisionSchedules.map(
                                                    (schedule) =>
                                                        <IntervieweeSchedule
                                                            key={schedule.intervieweeReg}
                                                            schedule={schedule}
                                                            interviews={
                                                                this.state.interviews && this.state.interviews.filter(
                                                                    (interview) => interview.intervieweeReg === schedule.intervieweeReg
                                                                )
                                                            }
                                                            onStartInterview={this.onStartInterview}/>
                                                )
                                            }
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ) :
                        (
                            <div className='App-Card'>
                                Fetching your sitting information...
                            </div>
                        )
                }
            </div>
        );
    }
}

export default Sitting;