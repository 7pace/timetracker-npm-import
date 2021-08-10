import { injectable } from 'inversify';
import { Worklog } from '../models/worklog';
import axios from 'axios';
import * as util from 'util';
import { AuthType } from '../models/authtype';

const config = require('../../config.json');
var httpntlm = require('httpntlm');
const httpntlmGetAsync = util.promisify(httpntlm.get);
const httpntlmPostAsync = util.promisify(httpntlm.post);

@injectable()
export class APIService{
    readonly  apiVersion: string = "3.0-preview";
    constructor() {}

    async getUsers(apiUrl: string, auth: AuthType, token: string, organization: string, user: string, password: string): Promise<Map<string, string>> {       
        var users: Map<string, string> = new Map<string, string>();
      
        try {
            var response;
            if(auth == AuthType.token)
            {               
                var opt = { headers: { 'Authorization': `Bearer ${token}`}, params: { 'api-version': this.apiVersion }};
                response = (await axios.get(apiUrl + '/api/rest/users', opt)).data;
            }
            else {
                var res = await httpntlmGetAsync({
                    url: apiUrl + `/api/${organization}/rest/users?api-version=${this.apiVersion}`,
                    username: user,
                    password: password
                });
                response = JSON.parse(res.body);

                if(res.statusCode < 200 || res.statusCode > 299)
                    throw response.error;
            }
            if(response.data && Array.isArray(response.data)){        
                for (let index = 0; index < response.data.length; index++) {
                    const user = response.data[index];
                    if(user) {
                     var uniqueName = auth == AuthType.ntlm ? user.uniqueName.replace("\\", "\\\\") : user.uniqueName;   
                     if(uniqueName && !users.has(uniqueName)){
                        users.set(uniqueName, user.id);
                     }
                    }  
                } 
            }
        } 
        catch (error) {
          if(error.response && error.response.data.error)
            throw error.response.data.error;
          else if(error.message) throw error.message; else throw error;
        }

        return users;
    }

    async getActivityTypes(apiUrl: string, auth: AuthType, token: string, organization: string, user: string, password: string): Promise<Map<string, string>> {       
        var activityTypes: Map<string, string> = new Map<string, string>();

        try {
            var response;
            if(auth == AuthType.token) {
                var opt = { headers: { 'Authorization': `Bearer ${token}`}, params: { 'api-version': this.apiVersion }};
                response = (await axios.get(apiUrl + '/api/rest/activityTypes', opt)).data;
            }
            else {
                var res = await httpntlmGetAsync({
                    url: apiUrl + `/api/${organization}/rest/activityTypes?api-version=${this.apiVersion}`,
                    username: user,
                    password: password
                });
                response = JSON.parse(res.body);

                if(res.statusCode < 200 || res.statusCode > 299)
                    throw response.error;
            }

            if(response.data.activityTypes && Array.isArray(response.data.activityTypes)){        
                for (let index = 0; index < response.data.activityTypes.length; index++) {
                    const activityType = response.data.activityTypes[index];   

                    if(activityType && activityType.name && !activityTypes.has(activityType.name)){
                        activityTypes.set(activityType.name, activityType.id);
                    }  
                } 
            }
        } 
        catch (error) {
            if(error.response && error.response.data.error)
                throw error.response.data.error;
            else if(error.message) throw error.message; else throw error;
        }
        return activityTypes;
    }

    async postWorklogsBatch(worklogs: Worklog[], validateOnly: boolean, apiUrl: string, auth: AuthType, token: string, organization: string, user: string, password: string) {        
        const batchesCount = Math.ceil(worklogs.length/500);

        try {
            if(auth == AuthType.token) {
                var opt = { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json'}, params: { 'api-version': this.apiVersion, 'validateOnly': validateOnly},};
                var url = apiUrl + '/api/rest/workLogs/batch';
                for (let index = 0; index < batchesCount; index++) {
                    var batch = worklogs.slice(index * 500, (index + 1) * 500);  
                    var res = await axios.post(url, batch, opt);
                }
            }
            else {
                for (let index = 0; index < batchesCount; index++) {
                    var batch = worklogs.slice(index * 500, (index + 1) * 500);
                    var resp = await httpntlmPostAsync({
                        url: apiUrl + `/api/${organization}/rest/workLogs/batch?api-version=${this.apiVersion}&validateOnly=${validateOnly}`,
                        username: user,
                        password: password,
                        body: JSON.stringify(batch),
                        headers: { 'Content-Type': 'application/json' }
                    });
                    
                    var response = JSON.parse(resp.body);
                    if(resp.statusCode < 200 || resp.statusCode > 299)
                        throw response.error;
                }               
            }            
        } 
        catch (error) {
            if(error.response && error.response.data.error)
                throw error.response.data.error;
            else if(error.message) throw error.message; else throw error;
        }
    }
}