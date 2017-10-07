import React, {Component} from 'react';
import Sitting from "./Sitting";
import Sittings from "./Sittings";
import InterviewPage from "./InterviewPage";

class InterviewerApp extends Component {
    constructor(props) {
        super(props);
        this.state = {mySitting: null};
    }

    render() {
        return (
            <div>
                {
                    this.getActivePage()
                }
            </div>
        );
    }

    getActivePage() {
        if (this.state.schedule)
            return (
                <InterviewPage schedule={this.state.schedule}/>
            );
        else if (this.state.mySitting)
            return (
                <Sitting interviewerProfile={this.props.interviewerProfile}
                         onNotInSitting={() => this.setState({mySitting: null})}
                         onStartInterview={(schedule) => this.setState({schedule})}/>
            );
        else
            return (
                <Sittings interviewerProfile={this.props.interviewerProfile}
                          onAlreadyInSitting={(sitting) => this.setState({mySitting: sitting})}/>
            );
    }
}

export default InterviewerApp;