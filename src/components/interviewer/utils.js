import {fetchFromSheet} from "../../utils";
import {SHEETS} from "../../sensitive_constants";

export const fetchSittings = (interviewerProfile, onResult) => {
    fetchFromSheet(SHEETS.Sittings, 'A2:Z')
        .then(function (response) {
            const range = response.result;
            if (range.values && range.values.length > 0) {
                const myEmail = interviewerProfile.googleProfile.getEmail();
                const myDivision = interviewerProfile.division;
                const sittings = range.values
                    .map((row) => {
                        const sitting = {
                            id: row[0],
                            division: row[1],
                            startTime: new Date(row[2]),
                            endTime: row[3] === "" ? null : new Date(row[3]),
                            interviewerEmails: []
                        };
                        const interviewers = sitting.interviewerEmails;
                        for (let i = 4; i < row.length; i++) {
                            if (row[i] === "")
                                break;
                            else
                                interviewers.push(row[i]);
                        }
                        return sitting
                    });
                const divisionSittings = sittings
                    .filter((sitting) => sitting.division === myDivision);
                const activeDivisionSittings = divisionSittings
                    .filter((sitting) => sitting.endTime === null);
                let myActiveSittings = activeDivisionSittings
                    .filter((sitting) => sitting.interviewerEmails.some((email) => myEmail === email));
                const myActiveSitting = myActiveSittings.length >= 1 ? myActiveSittings[0] : null;
                onResult(sittings, divisionSittings, activeDivisionSittings, myActiveSitting, null);
            }
        }, function (response) {
            onResult(
                null,
                null,
                null,
                null,
                response
            );
        });
};

export const fetchSchedules = (regNo) => {
    return fetchFromSheet(SHEETS.InterviewSchedules, 'R22:Y')
        .then(
            function (response) {
                const result = response.result;
                if (result && result.values)
                    if (result.values.length > 0)
                        return result.values
                            .map((row) => ({
                                intervieweeReg: row[0],
                                name: row[1],
                                pref1: {
                                    division: row[2],
                                    status: row[3],
                                    slot: row[4] === "" ? null : new Date(row[4]),
                                },
                                pref2: {
                                    division: row[5],
                                    status: row[6],
                                    slot: row[7] === "" ? null : new Date(row[7]),
                                },
                            }));
                    else
                        throw new Error("No interview schedule");
                else
                    throw new Error("Empty interview schedule result");
            }
        );
};

export const fetchInterviews = (regNo) => {
    return fetchFromSheet(SHEETS.InterviewLog, 'A7:H')
        .then(
            function (response) {
                const values = response.result.values;
                if (values) {
                    if (values.length > 0) {
                        return values
                            .map((row) => ({
                                intervieweeReg: row[0],
                                sittingId: row[1],
                                division: row[2],
                                interviewIndex: row[3],
                                startTime: !row[4] || row[4] === "" ? null : new Date(row[4]),
                                endTime: !row[5] || row[5] === "" ? null : new Date(row[5]),
                                status: row[6],
                                comments: row[7]
                            }));
                    } else {
                        throw new Error("No interview log");
                    }
                } else {
                    throw new Error("Empty interview log response");
                }
            }
        );
};