/* global gapi */
import React from 'react';
import {SHEETS, SPREADSHEET_ID} from "./sensitive_constants";


export const fetchFromSheet = (sheet, range) => {
    console.assert(typeof sheet.id === 'number', 'sheetId must be a number');
    return gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: sheet.name + "!" + range,
    });
};

export const getUpdateRequest = (sheetId, rowIndex, columnIndex, rows) => {
    console.assert(typeof sheetId === 'number', 'sheetId must be a number');
    return (
        {
            spreadsheetId: SPREADSHEET_ID,
            resource: {
                "requests": [
                    {
                        "updateCells": {
                            "rows": rows.map((row) => {
                                    return (
                                        {
                                            "values": row.map((value) => {
                                                return (
                                                    {
                                                        "userEnteredValue":
                                                            (typeof value === 'object') ? ({
                                                                [value.type]: value.data
                                                            }) : ({"stringValue": value})

                                                    }
                                                )
                                            })
                                        }
                                    )
                                }
                            ),
                            "fields": "userEnteredValue",
                            "start": {
                                "sheetId": sheetId,
                                "rowIndex": rowIndex,
                                "columnIndex": columnIndex
                            }
                        }
                    }
                ],
                "includeSpreadsheetInResponse": false
            }
        }
    );
};

export const appendToSheet = (sheet, range, rows) => {
    console.assert(typeof sheet.id === 'number', 'sheetId must be a number');
    return gapi.client.sheets.spreadsheets.values.append(
        {
            spreadsheetId: SPREADSHEET_ID,
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            range: sheet.name + "!" + range,
            resource: {
                range: sheet.name + "!" + range,
                majorDimension: 'ROWS',
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
                            if (row[i] && row[i] === "")
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
        }.bind(this), function (response) {
            onResult(
                null,
                null,
                null,
                null,
                response
            );
        });
};