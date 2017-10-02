/* global gapi */
import {SHEETS, SPREADSHEET_ID} from "./sensitive_constants";
import moment from "moment";


export const fetchFromSheet = (sheet, range) => {
    console.assert(typeof sheet.id === 'number', 'sheetId must be a number');
    return gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: sheet.name + "!" + range,
    });
};

export const updateSheet = (sheet, range, rows) => {
    console.assert(typeof sheet.id === 'number', 'sheetId must be a number');
    return gapi.client.sheets.spreadsheets.values.append(
        {
            spreadsheetId: SPREADSHEET_ID,
            range: sheet.name + "!" + range,
            valueInputOption: 'USER_ENTERED',
            includeValuesInResponse: true,
            resource: {
                values: rows
            }
        }
    );
};

export const appendToSheet = (sheet, range, rows) => {
    console.assert(typeof sheet.id === 'number', 'sheetId must be a number');
    return gapi.client.sheets.spreadsheets.values.append(
        {
            spreadsheetId: SPREADSHEET_ID,
            range: sheet.name + "!" + range,
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            includeValuesInResponse: true,
            resource: {
                values: rows
            }
        }
    );
};

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

export const googleDateFormat = (date) => moment(new Date()).format("MM/DD/YYYY HH:mm:ss");


// export const getUpdateRequest = (sheetId, rowIndex, columnIndex, rows) => {
//     console.assert(typeof sheetId === 'number', 'sheetId must be a number');
//     return (
//         {
//             spreadsheetId: SPREADSHEET_ID,
//             range: "",
//             resource: {
//                 "requests": [
//                     {
//                         "updateCells": {
//                             "rows": rows.map((row) => {
//                                     return (
//                                         {
//                                             "values": row.map((value) => {
//                                                 return (
//                                                     {
//                                                         "userEnteredValue":
//                                                             (typeof value === 'object') ? ({
//                                                                 [value.type]: value.data
//                                                             }) : ({"stringValue": value})
//
//                                                     }
//                                                 )
//                                             })
//                                         }
//                                     )
//                                 }
//                             ),
//                             "fields": "userEnteredValue",
//                             "start": {
//                                 "sheetId": sheetId,
//                                 "rowIndex": rowIndex,
//                                 "columnIndex": columnIndex
//                             }
//                         }
//                     }
//                 ],
//                 "includeSpreadsheetInResponse": false
//             }
//         }
//     );
// };
