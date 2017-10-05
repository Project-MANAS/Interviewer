import React from 'react';
import IntervieweeStatus from "./IntervieweeStatus";
import moment from "moment";

const IntervieweePreferenceInfo = (props) => {
    const pref = props.pref;
    return [
        <td>{pref.division}</td>
        ,
        <td><p>{pref.slot && moment(pref.slot).format("YYYY-MM-DD HH:mm:ss")}</p></td>
        ,

        <td>{IntervieweeStatus({prefStatus: pref.status, interviews: props.interviews})}</td>

    ];
};

export default IntervieweePreferenceInfo;