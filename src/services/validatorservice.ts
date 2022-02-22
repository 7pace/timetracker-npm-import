import { injectable } from 'inversify';
import * as fs from 'fs';
import { AuthType } from '../models/authtype';

const colors = require("colors");
const config = require('../../config.json');

@injectable()
export class ValidatorService{
    constructor() {}

    showSuccess(message: any) {
      console.log(colors.green(message));
    } 

    showError(error: any) {
      console.error(colors.red(error));
    }
    
    showErrors(errors: Array<any>) {
      for (let index = 0; index < errors.length; index++) {
        console.error(colors.red(errors[index]));
      }     
    } 
    
    validate(program: any) : boolean {
        var errorsExist: boolean = false;
        if (!program.file){
          this.showError('File is not specified');
          errorsExist = true;
        }
        else{
          try {
            if(!fs.existsSync(program.file)){
              this.showError(`File "${program.file}" does not exist.`);
              errorsExist = true;
            }
            else{
              var extFile: string = program.file.split('.').pop().toLowerCase();
              if(!(extFile === "xlsx" || extFile === "xls" || extFile === "csv")){
                this.showError(`File "${program.file}" is not in supported format(xlsx/xls/csv).`);
                errorsExist = true;
              }
            }
          } catch (error) {
            this.showError(error);
            errorsExist = true;
          }
        }
        if(!(program.authorization.toLowerCase() in AuthType)){
          this.showError('Unknown API authorization type. Supported types: "token", "ntlm"');
          errorsExist = true;
        }
        if (!config.map && !program.map){
          this.showError("Map is not specified in config.json");
          errorsExist = true;
        }
        if (program.authorization.toLowerCase() == AuthType.ntlm.valueOf() && (!program.api || !program.organization)){
          this.showError("Api url and organization are not specified");
          errorsExist = true;
        }
        if (program.authorization.toLowerCase() == AuthType.token.valueOf() && !program.token){
          if(!config.organizationTokens || config.organizationTokens.length === 0){
            this.showError("Token is not specified, and organizationTokens not specified in config.json");
            errorsExist = true;
          }
        }
        if (program.authorization.toLowerCase() == AuthType.ntlm.valueOf() && (!program.user || !program.password)){
          this.showError("User and password are not specified");
          errorsExist = true;
        }
    
        return errorsExist;
    }
}