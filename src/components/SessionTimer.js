import React, {Component} from "react";
import moment from 'moment';

class SessionTimer extends Component {
    constructor(props) {
        super(props);
        const endDate = this.props.endTime || new Date();
        const duration = moment.duration(endDate - this.props.startTime);
        this.state = {
            time: moment.utc(duration.asMilliseconds()).format("HH:mm:ss")
        };
    }

    componentDidMount() {
        if (!this.props.endTime) {
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
            time: moment.utc(duration.asMilliseconds()).format("HH:mm:ss")
        });
    }

    render() {
        return (
            <p className="App-Timer" style={this.props.style}>
                {this.state.time}
            </p>
        );
    }
}

export default SessionTimer;