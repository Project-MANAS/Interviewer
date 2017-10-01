import IntervieweePreferenceInfo from "./IntervieweePreferenceInfo";
import React from 'react';

const interviewsOfDivision = (interviews, division) => interviews && interviews.filter(
    interview => interview.division === division
);

const IntervieweeSchedule = (props) => {
    const schedule = props.schedule;
    return (
        <tr key={schedule.intervieweeReg}>
            <td>{schedule.intervieweeReg}</td>
            <td>{schedule.name}</td>
            <td>
                <IntervieweePreferenceInfo
                    pref={schedule.pref1}
                    interviews={interviewsOfDivision(props.interviews, schedule.pref1.division)}/>
            </td>
            <td>
                <IntervieweePreferenceInfo
                    pref={schedule.pref2}
                    interviews={interviewsOfDivision(props.interviews, schedule.pref2.division)}/>
            </td>
            <td>
                <button onClick={() => props.onStartInterview(schedule)}>
                    START INTERVIEW
                </button>
            </td>
        </tr>
    );
};

export default IntervieweeSchedule;