/* global gapi */
import React from 'react';
import {SPREADSHEET_ID} from "./sensitive_constants";


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

export const getAppendRequest = (sheet, range, rows) => {
    console.assert(typeof sheet.id === 'number', 'sheetId must be a number');
    return (
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