import React, {Component} from "react";
import moment from 'moment';

class SessionTimer extends Component {
    constructor(props) {
        super(props);
        const duration = moment.duration(new Date() - this.props.startTime);
        this.state = {
            time: moment.utc(duration.asMilliseconds()).format("mm:ss")
        };
    }

    componentDidMount() {
        if (!this.state.endTime) {
            this.intervalID = setInterval(
                () => this.tick(),
                1000
            );
        }
    }

    componentWillUnmount() {
        clearInterval(this.intervalID);
    }

    tick() {
        const duration = moment.duration(new Date() - this.props.startTime);
        this.setState({
            time: moment.utc(duration.asMilliseconds()).format("mm:ss")
        });
    }

    render() {
        return (
            <p className="App-Timer">
                {this.state.time}
            </p>
        );
    }
}

export default SessionTimer;