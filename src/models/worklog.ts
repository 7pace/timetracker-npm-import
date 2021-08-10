export interface Worklog {
    userId? : string;
    workItemId? : number;
    timeStamp? : string;
    length? : number;
    billableLength? : number;
    comment? : string;
    activityTypeId? : string;
}