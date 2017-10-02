import React, {Component} from 'react';
import BackendlessNotificationPropagator from "../scheduler/notification/BackendlessNotificationPropagator";
import Sitting from "./Sitting";
import Sittings from "./Sittings";

class InterviewerApp extends Component {
    constructor(props) {
        super(props);
        this.state = {mySitting: null};
    }

    render() {
        return (
            <div>
                <BackendlessNotificationPropagator/>
                {
                    this.state.mySitting ? (
                        <Sitting interviewerProfile={this.props.interviewerProfile}
                                 onNotInSitting={() => this.setState({mySitting: null})}/>
                    ) : (
                        <Sittings interviewerProfile={this.props.interviewerProfile}
                                  onAlreadyInSitting={(sitting) => this.setState({mySitting: sitting})}/>
                    )
                }
            </div>
        );
    }
}

export default InterviewerApp;