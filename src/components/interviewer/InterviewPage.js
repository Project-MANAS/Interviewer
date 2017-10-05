import {Component} from "react/lib/ReactBaseClasses";
import React from "react";

class InterviewPage extends Component {
    render() {
        return (
            <div>
                {JSON.stringify(this.props.schedule)}
            </div>
        );
    }
}

export default InterviewPage;