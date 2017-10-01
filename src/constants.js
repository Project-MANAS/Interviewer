const STATUS = {
    PENDING: null, SCHEDULED: null, INFORMED: null, CONFIRMED: null,
    ARRIVED: null, MISSED: null, REJECTED: null, ACCEPTED: null
};

const STATUS_INTERVIEWS_COMPLETE = [STATUS.REJECTED, STATUS.ACCEPTED];

Object.keys(STATUS).forEach(status => STATUS[status] = status);