import SessionTimer from "../SessionTimer";
import React from 'react';

const IntervieweeStatus = (props) => {
    const prefStatus = props.prefStatus;
    if (props.interviews && props.interviews.length === 0) {
        return (
            <div>
                {
                    props.interviews.map((interview) =>
                        <tr>
                            <td>
                                {interview.sittingId}
                            </td>
                            <SessionTimer
                                startTime={interview.startTime}
                                endTime={interview.endTime}/>
                            <td>
                                {interview.statusMsg}
                            </td>
                        </tr>
                    )
                }
            </div>
        );
    } else {
        return (
            <p>{prefStatus}</p>
        );
        // return <p>¯\_(ツ)_/¯</p>;
    }
};

export default IntervieweeStatus;