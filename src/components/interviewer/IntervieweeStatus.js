import SessionTimer from "../SessionTimer";
import React from 'react';
import {DAY_TERMINAL_INTERVIEW_STATUS} from '../../constants'

const IntervieweeStatus = (props) => {
    const day_terminal = DAY_TERMINAL_INTERVIEW_STATUS;
    if (day_terminal.includes(props.prefStatus)) {
        return <p>{props.prefStatus}</p>;
    } else if (props.interviews && props.interviews.length > 0) {
        return props.interviews.map((interview) =>
            <p>
                {interview.sittingId}
                <SessionTimer style={{display: 'inline-block'}}
                              startTime={interview.startTime}
                              endTime={interview.endTime}/>
                {interview.status}
            </p>
        );
    } else {
        return <p>{props.prefStatus}¯\_(ツ)_/¯</p>;
    }
};

export default IntervieweeStatus;