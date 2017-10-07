/* global gapi */
import {SPREADSHEET_ID} from "./sensitive_constants";
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

export const googleDateFormat = (date) => moment(new Date()).format("YYYY-MM-DD HH:mm:ss");


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
