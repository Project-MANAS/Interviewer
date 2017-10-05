import React from 'react';
import IntervieweeStatus from "./IntervieweeStatus";
import moment from "moment";

const IntervieweePreferenceInfo = (props) => {
    const pref = props.pref;
    return [
        <td key='division'>{pref.division}</td>
        ,
        <td key='slot'>{pref.slot && moment(pref.slot).format("YYYY-MM-DD HH:mm:ss")}</td>
        ,

        <td key='prefStatus'>{IntervieweeStatus({prefStatus: pref.status, interviews: props.interviews})}</td>

    ];
};

export default IntervieweePreferenceInfo;