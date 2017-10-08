import {DIVISIONS, SHEETS} from '../../sensitive_constants';
import {fetchFromSheet} from "../../utils";

export const fetchSchedulerInterviewees = () => {
    return fetchFromSheet(SHEETS.Scheduler, 'S22:AE')
    // return getDummyInterviewees()
        .then(
            function (response) {
                const result = response.result;
                if (result && result.values)
                    if (result.values.length > 0)
                        return result.values
                            .map((row) => ({
                                regNo: row[0],
                                yr: row[1],
                                pref1: {
                                    division: row[2],
                                    status: row[4] === "" ? null : parseInt(row[4]),
                                    slot: row.length <= 11 || !row[11] || row[11] === "" ? null : new Date(row[11]),
                                },
                                pref2: {
                                    division: row[3],
                                    status: row[5] === "" ? null : parseInt(row[5]),
                                    slot: row.length <= 12 || !row[12] || row[12] === "" ? null : new Date(row[12]),
                                },
                                branch: row[6],
                                cgpa: row.length <= 7 ? null : parseFloat(row[7])
                            }));
                    else
                        throw new Error("No interviewees to schedule");
                else
                    throw new Error("Empty interviewee to schedule result");
            }
        )
};

export const fetchSchedulingRequirements = () => {
    return fetchFromSheet(SHEETS.Scheduler, 'AN5:AV').then(
        function (response) {
            const result = response.result;
            if (result && result.values)
                if (result.values.length > 0) {
                    const slots = result.values.filter(row => row[0] !== "").map(row => new Date(row[0]));
                    if (slots.length === 0)
                        throw new Error("No interview slots specified");
                    const capacities = result.values
                        .map((row) => ({
                            [DIVISIONS[0]]: parseInt(row[5]),
                            [DIVISIONS[1]]: parseInt(row[6]),
                            [DIVISIONS[2]]: parseInt(row[7]),
                            [DIVISIONS[3]]: parseInt(row[8])
                        }));
                    if (capacities.length === 0)
                        throw new Error("No capacities specified");
                    return [slots, capacities];
                } else
                    throw new Error("No scheduling requirements specified");
            else
                throw new Error("Empty scheduling requirements");
        }
    );
};