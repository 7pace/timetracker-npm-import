import { injectable, inject } from 'inversify';
import * as XLSX from 'xlsx';
import { ColumnsMap } from '../models/columnsmap';
import { Worklog } from '../models/worklog';
import { APIService } from '../services/apiservice';
import { AuthType } from '../models/authtype';

const config = require('../../config.json');

@injectable()
export class DataService{
    constructor(@inject('APIService') private apiService: APIService) {}

    getMappingData(file: string, columnsFromExcel : boolean, apiUrl? : string, defaultOrganization? : string): Map<string, Worklog[]> {

        var result: Map<string, Worklog[]> = new Map<string, Array<Worklog>>();
        var errors: Array<string> = new Array<string>();

        var wb: XLSX.WorkBook = XLSX.readFile(file);       
        var sheet_name_list = wb.SheetNames;
        var opt: XLSX.Sheet2JSONOpts = columnsFromExcel ? { raw: false } : { header: "A", raw: false};
        var xlData : Array<any> = XLSX.utils.sheet_to_json(wb.Sheets[sheet_name_list[0]], opt);
        var map: ColumnsMap = columnsFromExcel 
          ? {userName: 'UserName', workItem: 'WorkItem', timeStamp: 'TimeStamp', duration: 'Duration', 
              billableDuration: 'BillableDuration', comment: 'Comment', activityType: 'ActivityType',
              date: 'Date', start: 'Start', organization: 'Organization'} 
          : config.map as ColumnsMap;
        var addIndex = columnsFromExcel ? 2 : 1;
        let requireOrganization = !apiUrl
        for (let index = 0; index < xlData.length; index++) {
          const element = xlData[index];
          var workLog : Worklog = {};
      
          if(map.userName && element[map.userName]){
            workLog.userId = element[map.userName];
          }
      
          if(map.workItem && element[map.workItem]){
            var number = Number(element[map.workItem]);
            if(!isNaN(number) && Number.isInteger(number) && number > 0)
              workLog.workItemId = number;
            else
              errors.push(`"WorkItem" is not a valid value in a cell ${map.workItem}${index + addIndex}. The value may be not specified or must be an integer and greater than 0.`);
          }
      
          if(map.timeStamp && element[map.timeStamp]){
            var date = Date.parse(element[map.timeStamp]);
            if(!isNaN(date))
              workLog.timeStamp = new Date(date).toLocaleString();
            else 
              errors.push(`"TimeStamp" is not a valid datetime value in a cell ${map.timeStamp}${index + addIndex}.`);
          } else{
            if(map.date && element[map.date]){
              var timestamp = element[map.date]
              if(map.start && element[map.start]){
                timestamp += " " + element[map.start];
              }
              else{
                timestamp += " 9:00 AM";
              }
              var date = Date.parse(timestamp);
              if(!isNaN(date)){
                workLog.timeStamp = new Date(date).toLocaleString();
              }
              else {
                errors.push(`"Date" and "Start" do not specify a valid starting datetime value "${timestamp}" in a cell(s) ${map.date}${index + addIndex}.`);
              }
            }
          }
      
          if(map.duration && element[map.duration]){
            var number = Number(element[map.duration].replace(/,/g, '.'));
            if(!isNaN(number) && number > 0)
              workLog.length = Math.ceil(number * 3600);
            else
              errors.push(`"Duration" is not a valid value in a cell ${map.duration}${index + addIndex}. The value may be not specified or must be greater than 0.`);
          }
      
          if(map.billableDuration && element[map.billableDuration]){
            var number = Number(element[map.billableDuration].replace(/,/g, '.'));
            if(!isNaN(number) && number >= 0)
              workLog.billableLength = Math.ceil(number * 3600);
            else
              errors.push(`"BillableDuration" is not a valid value in a cell ${map.billableDuration}${index + addIndex}. The value may be not specified or must be greater or equal than 0.`);
          }
      
          if(map.activityType && element[map.activityType]){
            workLog.activityTypeId = element[map.activityType];
          }
      
          if(map.comment && element[map.comment]){
            workLog.comment = element[map.comment];
          }
      
          if((!workLog.comment || workLog.comment.trim() === '') && !workLog.workItemId)
          {
            errors.push(`"Comment" (cell ${map.comment}${index + addIndex}) and "WorkItem" (cell ${map.workItem}${index + addIndex}) are not specified. At least one of these values must be specified.`);
          }

          let mapKey
          if(map.organization && element[map.organization] && element[map.organization] !== ''){
            mapKey = element[map.organization];
          } else if(requireOrganization){
            if(!defaultOrganization || defaultOrganization.trim() === ''){
              errors.push(`"Organization" (cell ${map.comment}${index + addIndex}) and -o / --organization <organization> command line parameter are not specified. At least one of these values must be specified.`);
              continue;
            }
            else{
              mapKey = defaultOrganization;
            }
          } else{
            mapKey = apiUrl;
          }

          if(mapKey) {
            mapKey = mapKey.toLowerCase();
          }
          
          let orgResult = result.get(mapKey)
          let organizationWorkLogs: Worklog[] = orgResult ? orgResult : new Array<Worklog>();
          if(!result.has(mapKey)){
            result.set(mapKey, organizationWorkLogs);
          }
      
          organizationWorkLogs.push(workLog);   
        }

        if(errors.length > 0){
          throw errors;
        }
      
        return result;
    }

    async getUserIdActivityTypeId(worklogs: Worklog[], apiUrl: string, auth: AuthType,
       token: string, organization: string, user: string, password: string): Promise<Worklog[]> {

        var users: Map<string, string> = new Map<string, string>();
        var activityTypes: Map<string, string> = new Map<string, string>();
        if(worklogs.some((w) => w.userId))
        {
            users = await this.apiService.getUsers(apiUrl, auth, token, organization, user, password);
        }
        if(worklogs.some((w) => w.activityTypeId))
        {
            activityTypes = await this.apiService.getActivityTypes(apiUrl, auth, token, organization, user, password);
        }
                
        var errors: Set<string> = new Set<string>();

        for (let index = 0; index < worklogs.length; index++) {
          var worklog = worklogs[index];
      
          if(worklog.userId){
            if(users.has(worklog.userId)){
              worklog.userId = users.get(worklog.userId);
            }
            else{
              var err = `User "${worklog.userId}" does not exist in your organization`;
              if(!errors.has(err))
                errors.add(err);        
            }
          }
      
          if(worklog.activityTypeId){
            if(activityTypes.has(worklog.activityTypeId)){
              worklog.activityTypeId = activityTypes.get(worklog.activityTypeId);
            }
            else{
              var err = `Activity type "${worklog.activityTypeId}" does not exist in your organization`;
              if(!errors.has(err))
                errors.add(err);         
            }
          }             
        }
        if(errors.size > 0) {
          throw Array.from(errors);
        }

        return worklogs;
      }

      async sendWorklogs(worklogs: Worklog[], apiUrl: string, auth: AuthType, 
        token: string, organization: string, user: string, password: string) {
           await this.apiService.postWorklogsBatch(worklogs, true, apiUrl, auth, token, organization, user, password);
           await this.apiService.postWorklogsBatch(worklogs, false, apiUrl, auth, token, organization, user, password); 
      }
}
