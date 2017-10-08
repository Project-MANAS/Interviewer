export const INTERVIEW_STATUS = {
    PENDING: null, SCHEDULED: null, NOTIFIED: null, CONFIRMED: null,
    ARRIVED: null, ONGOING: null, MISSED: null, MAYBE: null, REJECTED: null, ACCEPTED: null
};

Object.keys(INTERVIEW_STATUS).forEach(status => INTERVIEW_STATUS[status] = status);

export const INTERVIEW_STATUS_CODE = {};

Object.keys(INTERVIEW_STATUS).forEach((status, index) => INTERVIEW_STATUS_CODE[status] = index + 1);

export const isScheduleRequiredStatusCode = (status) => {
    switch (status) {
        case INTERVIEW_STATUS_CODE[INTERVIEW_STATUS.PENDING]:
            return true;
        case status === null:
            return true;
        default:
            return false;
    }
};


export const TERMINAL_INTERVIEW_STATUS = [INTERVIEW_STATUS.REJECTED, INTERVIEW_STATUS.ACCEPTED];
export const DAY_TERMINAL_INTERVIEW_STATUS = [INTERVIEW_STATUS.MAYBE].concat(TERMINAL_INTERVIEW_STATUS);

export const INTERVIEW_ALLOTMENT_PRIORITY = {
    [INTERVIEW_STATUS_CODE[INTERVIEW_STATUS.PENDING]]: 1,
    [INTERVIEW_STATUS_CODE[INTERVIEW_STATUS.SCHEDULED]]: 0,
    [INTERVIEW_STATUS_CODE[INTERVIEW_STATUS.NOTIFIED]]: 0,
    [INTERVIEW_STATUS_CODE[INTERVIEW_STATUS.CONFIRMED]]: 0,
    [INTERVIEW_STATUS_CODE[INTERVIEW_STATUS.ARRIVED]]: 0,
    [INTERVIEW_STATUS_CODE[INTERVIEW_STATUS.ONGOING]]: 0,
    [INTERVIEW_STATUS_CODE[INTERVIEW_STATUS.MISSED]]: 0.1,
    [INTERVIEW_STATUS_CODE[INTERVIEW_STATUS.MAYBE]]: 0.5,
    [INTERVIEW_STATUS_CODE[INTERVIEW_STATUS.REJECTED]]: 0,
    [INTERVIEW_STATUS_CODE[INTERVIEW_STATUS.ACCEPTED]]: 0,
};