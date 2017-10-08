/* global Backendless */
/*global PublishOptions*/
/*global PublishOptionsHeaders*/

import React, {Component} from 'react';
import '../../App.css';
import BackendlessInitializer from "./notification/BackendlessInitializer";
import {fetchFromSheet, formattedDateTime} from "../../utils";
import {DIVISIONS, SHEETS} from "../../sensitive_constants";
import {fetchSchedulerInterviewees, fetchSchedulingRequirements} from "./utils";
import {INTERVIEW_ALLOTMENT_PRIORITY, isScheduleRequiredStatusCode} from "../../constants";

function UserTable() {
    this.registrationNumber = "";
    this.deviceToken = "";
}


class SchedulerApp extends Component {
    constructor(props) {
        super(props);

        this.onScheduleRequested = this.onScheduleRequested.bind(this);
        this.onChangeScheduleSpeed = this.onChangeScheduleSpeed.bind(this);

        this.state = {
            status: undefined,
            selectedRightPane: null,
            isBackendlessInitialized: false,
            pendingInterviewees: undefined,
            slots: undefined,
            capacities: undefined,
            scheduleSpeed: 50
        };
    }

    static scheduleRequiredFilter(interviewee) {
        return isScheduleRequiredStatusCode(interviewee.pref1.status) &&
            isScheduleRequiredStatusCode(interviewee.pref2.status) &&
            interviewee.pref1.slot === null && interviewee.pref2.slot === null;
    }

    static scheduleCompletedFilter(interviewee) {
        return !SchedulerApp.scheduleRequiredFilter(interviewee);
    }

    static filterScheduledInterviewees(interviewees) {
        return interviewees.filter(SchedulerApp.scheduleCompletedFilter);
    }

    static filterPendingInterviewees(interviewees) {
        return interviewees.filter(SchedulerApp.scheduleRequiredFilter);
    }

    static allotmentScore(interviewee, slot, utilization) {
        const permPriority = interviewee.yr === 1 && slot.getHours() >= (12 + 9) ? 0 : 1;

        const pref1AvailPriority = 1 - utilization.divUtilization[DIVISIONS.indexOf(interviewee.pref1.division)];
        let pref2AvailPriority = 1 - utilization.divUtilization[DIVISIONS.indexOf(interviewee.pref2.division)];

        const pref1StatusPriority = INTERVIEW_ALLOTMENT_PRIORITY[interviewee.pref1.status];
        let pref2StatusPriority = INTERVIEW_ALLOTMENT_PRIORITY[interviewee.pref2.status];

        const branchPriority = 1;
        const cgpaPriority = 1;

        if (interviewee.pref1.division === interviewee.pref2.division) {
            pref2AvailPriority = 1;
            pref2StatusPriority = 1;
        }
        const score = Math.max(0, permPriority) *
            Math.max(0, pref1AvailPriority) * Math.max(0, pref2AvailPriority) *
            Math.max(0, pref1StatusPriority) * Math.max(0, pref2StatusPriority) *
            Math.max(0, branchPriority) *
            Math.max(0, cgpaPriority);

        return score;
    }

    componentDidMount() {
        this.refresh();
    }

    refresh() {
        this.fetchPendingInterviewees();
    }

    selectPane(paneId) {
        if (paneId === this.state.selectedRightPane)
            this.setState({selectedRightPane: null});
        else
            this.setState({selectedRightPane: paneId});

    }

    getSelectedPane(selectedRightPane) {
        switch (selectedRightPane) {
            case 'notifications':
                return <BackendlessInitializer onInitialized={() => this.setState({isBackendlessInitialized: true})}/>;
            default:
                return null;
        }
    }

    notify(interviewees) {
        let regArray = [];
        fetchFromSheet(SHEETS.Scheduler, 'B22:G').then(function (response) {
            const values = response.result.values;
            values.forEach(function (row) {
                if (row[row.length - 1] === "SCHEDULED") {
                    console.log(row[0]);
                    regArray.push(row[0]);
                }
            });
            let deviceArray = [];

            regArray.forEach(function (regNum) {
                let whereClause = "registrationNumber = '" + regNum + "'";
                let queryBuilder = Backendless.DataQueryBuilder.create().setWhereClause(whereClause);
                let result = Backendless.Data.of(UserTable).findSync(queryBuilder);
                deviceArray.push(result[0].deviceToken);
            });
            const channel = "default",
                message = "Hello world ",
                publishOptions = new Backendless.PublishOptions({
                    headers: {
                        'android-content-sound': "Interview",
                        'android-ticker-text': "pref2Confirm",
                        'android-content-title': "This is a notification title",
                        'android-content-text': "Push notifications are cool"
                    }
                }),
                deliveryOptions = new Backendless.DeliveryOptions({
                    pushSinglecast: deviceArray
                });
            if (deviceArray.length > 0) {
                const messageStatus = Backendless.Messaging.publishSync(channel, message, publishOptions, deliveryOptions);
            }

        });
    }

    onScheduleRequested() {
        this.schedule(this.state.interviewees, this.state.slots, this.state.capacities)
            .catch(error => {
                this.setState({status: "Failed to schedule:" + JSON.stringify(error)});
            });
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getRemainingSlots(slots, updatedUtilization) {
        return slots.filter(
            (slot, slotI) => updatedUtilization[slotI].divUtilization.reduce(
                (sum, val) => sum + val, 0
            ) < 1 * DIVISIONS.length
        );
    }

    async schedule(interviewees, slots, capacities) {
        let pendingInterviewees = SchedulerApp.filterPendingInterviewees(interviewees);
        let updatedUtilization = this.getUtilization(interviewees, slots, capacities);
        let remainingSlots = this.getRemainingSlots(slots, updatedUtilization);

        while (pendingInterviewees.length > 0) {
            let maxScore = 0, maxIntervieweeI = -1, maxSlotI = -1;
            pendingInterviewees.forEach((interviewee, intervieweeI) => {
                    interviewee.maxScore = 0;
                    pendingInterviewees.maxSlot = -1;
                    remainingSlots.forEach((slot, slotI) => {
                            const score = SchedulerApp.allotmentScore(interviewee, slot, updatedUtilization[slotI]);
                            if (!interviewee.maxScore || score > interviewee.maxScore) {
                                interviewee.maxScore = score;
                                interviewee.maxSlot = slot;
                            }
                            if (score > maxScore) {
                                maxScore = score;
                                maxIntervieweeI = intervieweeI;
                                maxSlotI = slotI;
                            }
                        }
                    )
                }
            );

            if (maxScore === 0) {
                throw "No remaining viable schedules";
            } else {
                pendingInterviewees[maxIntervieweeI].pref1.slot =
                    pendingInterviewees[maxIntervieweeI].pref2.slot =
                        remainingSlots[maxSlotI];
            }

            pendingInterviewees = SchedulerApp.filterPendingInterviewees(pendingInterviewees);
            updatedUtilization = this.getUtilization(interviewees, slots, capacities);
            this.setState({pendingInterviewees, utilization: updatedUtilization});
            remainingSlots = this.getRemainingSlots(slots, updatedUtilization);
            await this.sleep(1000 * (100.0 / (parseInt(this.state.scheduleSpeed)) - 1));
        }

    }

    fetchPendingInterviewees() {
        fetchSchedulerInterviewees().catch(
            function (error) {
                this.setState({status: 'Failed to fetch scheduler interviewees: ' + JSON.stringify(error)});
            }.bind(this)
        ).then(
            function (interviewees) {
                this.setState({interviewees, slots: undefined, capacities: undefined});
                return fetchSchedulingRequirements()
            }.bind(this)
        ).catch(
            function (error) {
                this.setState({status: 'Failed to fetch scheduler requirements: ' + JSON.stringify(error)});
            }.bind(this)
        ).then(
            function ([slots, capacities]) {
                const slotLen = slots.length, capLen = capacities.length;
                if (slotLen > capLen)
                    slots = slots.slice(0, capLen);
                if (capLen > slotLen)
                    capacities = capacities.slice(0, slotLen);
                const utilization = this.getUtilization(this.state.interviewees, slots, capacities);
                this.setState({slots, capacities, utilization});
            }.bind(this)
        );
    }

    getUtilization(interviewees, slots, capacities) {
        const utilization = slots.map((slot, i) => {
                return {
                    slot: slot,
                    divUtilization: this.getSlotUtilizations(interviewees, slot, capacities[i])
                }
            }
        );
        this.setState({utilization});
        return utilization;
    }

    getSlotUtilizations(interviewees, slot, capacities) {
        let divisionAllotment = {};
        DIVISIONS.forEach(div => divisionAllotment[div] = 0);
        interviewees.forEach(interviewee => {
            if (interviewee.pref1.slot && interviewee.pref1.slot.getTime() === slot.getTime()) {
                divisionAllotment[interviewee.pref1.division]++;
            }
            if (interviewee.pref2.slot && interviewee.pref1.division !== interviewee.pref2.division &&
                interviewee.pref2.slot.getTime() === slot.getTime()) {
                divisionAllotment[interviewee.pref2.division]++;
            }
        });
        return DIVISIONS.map(
            (division) => divisionAllotment[division] / capacities[division]
        )
    }

    onChangeScheduleSpeed(event) {
        this.setState({scheduleSpeed: parseInt(event.target.value)});
    }

    render() {
        return (
            <div>
                <div id='primary-content' style={{display: 'inline-block'}}>
                    <div className='App-Card'>
                        <h3 className='Section' style={{display: 'inline-block'}}>Scheduling Status</h3>
                        <div style={{display: 'inline-block', float: 'right'}}>
                            <button onClick={() => this.refresh()}>REFRESH</button>
                            <button onClick={() => this.onScheduleRequested()}>SCHEDULE</button>
                            <div>
                                <input type="range" min="10" max="100" className="slider" id="myRange"
                                       onChange={this.onChangeScheduleSpeed}/>
                                <p>Scheduling Speed: {this.state.scheduleSpeed}</p>
                            </div>
                        </div>
                        <p>{this.state.status && this.state.status}</p>
                        <div className='Section' style={{display: 'inline-block'}}>
                            <h4>Statistics</h4>
                            <table>
                                <tbody>
                                {
                                    this.state.interviewees &&
                                    <tr>
                                        <td>Total interviewees</td>
                                        <td>{this.state.interviewees.length}</td>
                                    </tr>
                                }
                                {
                                    this.state.pendingInterviewees &&
                                    <tr>
                                        <td>Interviewees to schedule</td>
                                        <td>{this.state.pendingInterviewees.length}</td>
                                    </tr>
                                }
                                {
                                    this.state.interviewees && this.state.pendingInterviewees &&
                                    <tr>
                                        <td>Scheduled interviewees</td>
                                        <td>{this.state.interviewees.length - this.state.pendingInterviewees.length}</td>
                                    </tr>
                                }
                                </tbody>
                            </table>
                        </div>
                        <div className='Section' style={{display: 'inline-block'}}>
                            <h4>Slot utilization</h4>
                            <table className='Sheet'>
                                <thead>
                                <tr>
                                    <td>Slot</td>
                                    {DIVISIONS.map((division) => <td key={division}>{division}</td>)}
                                </tr>
                                </thead>
                                <tbody>
                                {
                                    this.state.utilization &&
                                    this.state.utilization.map((utilization, i) =>
                                        <tr key={formattedDateTime(utilization.slot)}>
                                            <td>{formattedDateTime(utilization.slot)}</td>
                                            {
                                                utilization.divUtilization.map((divUtil, divI) =>
                                                    <td style={{background: 'rgba(255, 0, 0, ' + divUtil + ')'}}
                                                        key={DIVISIONS[divI]}>{Math.round(divUtil * 100) + "%"}</td>
                                                )
                                            }
                                        </tr>
                                    )
                                }
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div>
                        <div className='App-Card' style={{display: 'inline-block', verticalAlign: 'top'}}>
                            <h3>Pending interviewees</h3>
                            <table className='Sheet'>
                                <thead>
                                <tr>
                                    <td>RegNo</td>
                                    <td>Yr</td>
                                    <td>Division</td>
                                    <td>Slot</td>
                                    <td>Division</td>
                                    <td>Slot</td>
                                    <td>Branch</td>
                                    <td>CGPA</td>
                                    <td>Potential Slot</td>
                                    <td>Allotment Potential</td>
                                </tr>
                                </thead>
                                <tbody>
                                {
                                    this.state.pendingInterviewees &&
                                    this.state.pendingInterviewees
                                        .sort((a, b) => a.maxScore < b.maxScore)
                                        .map(interviewee =>
                                            <tr key={interviewee.regNo}>
                                                <td>{interviewee.regNo}</td>
                                                <td>{interviewee.yr}</td>
                                                <td>{interviewee.pref1.division}</td>
                                                <td>{interviewee.pref1.slot && formattedDateTime(interviewee.pref1.slot)}</td>
                                                <td>{interviewee.pref2.division}</td>
                                                <td>{interviewee.pref2.slot && formattedDateTime(interviewee.pref2.slot)}</td>
                                                <td>{interviewee.branch}</td>
                                                <td>{interviewee.cgpa}</td>
                                                <td>{formattedDateTime(interviewee.maxSlot)}</td>
                                                <td style={{background: 'rgba(255, 0, 0, ' + (1 - interviewee.maxScore) + ')'}}>
                                                    {Math.round(interviewee.maxScore * 100) + "%"}
                                                </td>
                                            </tr>
                                        )
                                }
                                </tbody>
                            </table>
                        </div>
                        <div className='App-Card' style={{display: 'inline-block', verticalAlign: 'top'}}>
                            <h3>Scheduled Interviewees</h3>
                            <table className='Sheet'>
                                <thead>
                                <tr>
                                    <td>RegNo</td>
                                    <td>Yr</td>
                                    <td>Division</td>
                                    <td>Slot</td>
                                    <td>Division</td>
                                    <td>Slot</td>
                                    <td>Branch</td>
                                    <td>CGPA</td>
                                </tr>
                                </thead>
                                <tbody>
                                {
                                    this.state.interviewees &&
                                    SchedulerApp.filterScheduledInterviewees(this.state.interviewees)
                                        .sort((a, b) => a.maxScore < b.maxScore)
                                        .map(interviewee =>
                                            <tr key={interviewee.regNo}>
                                                <td>{interviewee.regNo}</td>
                                                <td>{interviewee.yr}</td>
                                                <td>{interviewee.pref1.division}</td>
                                                <td>{interviewee.pref1.slot && formattedDateTime(interviewee.pref1.slot)}</td>
                                                <td>{interviewee.pref2.division}</td>
                                                <td>{interviewee.pref2.slot && formattedDateTime(interviewee.pref2.slot)}</td>
                                                <td>{interviewee.branch}</td>
                                                <td>{interviewee.cgpa}</td>
                                            </tr>
                                        )
                                }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className='Pane' style={{display: 'inline-block'}}>
                    <div id='right-pane-body' className='PaneBody'>
                        {
                            this.getSelectedPane(this.state.selectedRightPane)
                        }
                    </div>
                    <div id='right-pane-selectors' className='PaneSelectors'>
                        <button className='PaneSelector'
                                onClick={() => this.selectPane('notifications')}>
                            Initialize Notifications
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default SchedulerApp;