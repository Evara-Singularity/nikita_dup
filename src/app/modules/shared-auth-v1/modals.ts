export interface AuthFlowType
{
    isUserExists:boolean;
    flowType: string;
    identifierType: string;
    identifier: string;
    data?: any
}