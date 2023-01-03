export interface ServerLogSchema {
    logId?: any,
    startDateTime: any;
    endDateTime: any;
    startDateTimeV2?: any;
    endDateTimev2?: any;
    apiRequestTime?: any,
    apiURL: string;
    method: string;
    payload: any;
    responseStatus: any;
    sessionId: string;
}