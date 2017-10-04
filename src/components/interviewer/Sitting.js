import React, {Component} from 'react';
import SessionTimer from "../SessionTimer";
import {fetchFromSheet, fetchSittings, googleDateFormat, updateSheet} from "../../utils";
import {SHEETS} from "../../sensitive_constants";
import IntervieweeSchedule from "./IntervieweeSchedule";

class Sitting extends Component {
    constructor(props) {
        super(props);
        this.refresh = this.refresh.bind(this);
        this.endSitting = this.endSitting.bind(this);
        this.onStartInterview = this.onStartInterview.bind(this);
        this.onScheduleFetchSuccess = this.onScheduleFetchSuccess.bind(this);
        this.onScheduleFetchFailure = this.onScheduleFetchFailure.bind(this);
        this.onInterviewFetchSuccess = this.onInterviewFetchSuccess.bind(this);
        this.onInterviewFetchFailure = this.onInterviewFetchFailure.bind(this);
        this.state = {divisionSchedules: undefined};
    }

    componentDidMount() {
        this.refresh();
    }

    onStartInterview(schedule) {

    }

    onScheduleFetchSuccess(response) {
        const result = response.result;
        let schedules = undefined, myDivisionSchedules = undefined;
        if (result.values && result.values.length > 0) {
            const myDivision = this.state.mySitting.division;
            schedules = result.values
                .map((row) => ({
                    intervieweeReg: row[0],
                    name: row[1],
                    pref1: {
                        division: row[2],
                        status: row[4],
                        slot: row[6] === "" ? null : new Date(row[6]),
                    },
                    pref2: {
                        division: row[3],
                        status: row[5],
                        slot: row[7] === "" ? null : new Date(row[7]),
                    },
                }));
            myDivisionSchedules = schedules.filter(
                (schedule) => myDivision === schedule.pref1.division || myDivision === schedule.pref2.division
            );
        }
        let errMsg = null;
        if (!schedules)
            errMsg = "No interviews scheduled";
        else if (!myDivisionSchedules)
            errMsg = "No interviews scheduled for your division";
        this.setState({schedules, divisionSchedules: myDivisionSchedules, errorMessage: errMsg});

        fetchFromSheet(SHEETS.InterviewLog, 'A7:G')
            .then(this.onInterviewFetchSuccess, this.onInterviewFetchFailure);
    }

    onScheduleFetchFailure(response) {
        this.setState({
            schedules: undefined,
            divisionSchedules: undefined,
            errorMessage: "Failed to fetch schedules:" + response.result.error.message
        });
    }

    onInterviewFetchSuccess(response) {
        const values = response.result.values;
        let interviews = undefined, myDivisionInterviews = undefined, myActiveInterview = undefined;
        if (values) {
            interviews = values
                .map((row) => ({
                    intervieweeReg: row[0],
                    sittingId: row[1],
                    division: row[2],
                    interviewIndex: row[3],
                    startTime: row[4] === "" ? null : new Date(row[4]),
                    endTime: row[5] === "" ? null : new Date(row[5]),
                    status: row[6],
                    comments: row[7]
                }));

            const myDivision = this.props.interviewerProfile.division;
            const divisionSittingIds = this.state.divisionSittings
                .map((sitting) => myDivision === sitting.division);
            myDivisionInterviews = interviews.filter(
                (interview) => divisionSittingIds.some((id) => id === interview.sittingId)
            );

            const mySittingId = this.state.mySitting.id;
            const myActiveInterviews = myDivisionInterviews.filter(
                (interview) => mySittingId === interview.sittingId && interview.endTime === null
            );
            if (myActiveInterviews && myActiveInterviews.length >= 1) {
                myActiveInterview = myActiveInterviews[0];
            }
        }
        let errMsg = null;
        if (!interviews) {
            interviews = null;
            errMsg = "No interviews started today";
        } else if (!myDivisionInterviews) {
            myDivisionInterviews = null;
            errMsg = "No interviews started by your division";
        }
        this.setState({
            interviews,
            divisionInterviews: myDivisionInterviews,
            myInterview: myActiveInterview,
            errorMessage: errMsg
        });

    }

    onInterviewFetchFailure(response) {
        this.setState({
            interviews: null,
            divisionInterviews: null,
            myInterview: null,
            errorMessage: "Failed to fetch interviews: " + response.result.error.message,
        });
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
                    fetchFromSheet(SHEETS.InterviewSchedules, 'K5:R')
                        .then(this.onScheduleFetchSuccess, this.onScheduleFetchFailure);
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
        return (
            this.state.mySitting ? (
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
                                <button style={{display: 'inline-block'}} onClick={this.endSitting}>
                                    END SITTING
                                </button>
                            </div>
                        </div>
                        <div>
                            <div className='App-Card' style={{display: 'inline-block', float: 'left'}}>
                                <h5>Interviewers</h5>
                                <ol>
                                    {
                                        this.state.mySitting.interviewerEmails.map((email) => <li key={email}>{email}</li>)
                                    }
                                </ol>
                            </div>
                            <div className='App-Card' style={{display: 'inline-block', float: 'right'}}>
                                <h5>Interviewees</h5>
                                <table style={{fontSize: '10px'}}>
                                    <thead>
                                    <tr>
                                        <th>Registration Number</th>
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
        );
    }
}

export default Sitting;