export interface ServerLogSchema {
    startDateTime: any;
    endDateTime: any;
    apiURL: string;
    method: string;
    payload: any;
    responseStatus: any;
    sessionId: string;
}