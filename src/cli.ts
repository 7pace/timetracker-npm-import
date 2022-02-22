import { injectable, inject } from 'inversify';
import { ValidatorService } from './services/validatorservice';
import { DataService } from './services/dataservice';
import { Worklog } from './models/worklog';
import { AuthType } from './models/authtype';

const program = require('commander');
const config = require('../config.json');

@injectable()
export class CLI {

  constructor(@inject('ValidatorService') private validatorService: ValidatorService, 
              @inject('DataService') private dataService: DataService){
    this.executeCLI();
  } 

  public executeCLI(){
    program
      .name("import-worklogs")
      .version('0.0.2')
      .description("CLI for importing worklogs(csv/excel)")
      .option('-f, --file <file>', 'File path for importing(csv/excel)')
      .option('-a, --authorization [authorization]', 'API authorization type (token or ntlm). Default value is "token"', 'token')
      .option('-o, --organization <organization>', 'The name of your organization in Azure DevOps or collection in On-premise version')
      .option('--api [api]', 'The api url. This option is required for import to On-premise')
      .option('-t, --token [token]', 'Reporting API Access Token. This option is required for import to Azure DevOps')
      .option('-u, --user [user]', 'NTLM authorization username. This option is required for import import to On-premise version')
      .option('-p, --password [password]', 'NTLM authorization password. This option is required for import to On-premise version)')
      .option('-m, --map', 'Mapping worklog fields from column names(first row in Excel file)', false)
      .parse(process.argv);

      if (!process.argv.slice(2).length || this.validatorService.validate(program)) 
      {
        program.outputHelp();
        process.exit(1);
      }

      //work with excel data and mapping columns
      var mapData: Map<string, Worklog[]> = new Map<string, Array<Worklog>>();
      try {
        mapData = this.dataService.getMappingData(program.file, program.map, program.api, program.organization);
        if(mapData.size === 0){
          throw 'No worklog entries were found in the file.';
        }
      } 
      catch (error) {
        error instanceof Array ? this.validatorService.showErrors(error) : this.validatorService.showError(error);
        process.exit(1);
      }
      
      //api requests logic
      var authType: AuthType = program.authorization.toLowerCase() == AuthType.token ? AuthType.token : AuthType.ntlm;
      mapData.forEach((worklogs: Array<Worklog>, organization: string) => {
        const apiUrl: string = program.api ? program.api : `https://${organization}.timehub.7pace.com`;
        const token: string = program.token ? program.token : config.organizationTokens[organization];
        console.log(`Importing worklogs to ${apiUrl}...`);
        this.dataService.getUserIdActivityTypeId(worklogs, apiUrl, authType, token, organization, program.user, program.password)
        .then(() => {
          this.dataService.sendWorklogs(worklogs, apiUrl, authType, token, organization, program.user, program.password)
              .then(() => this.validatorService.showSuccess("Worklogs import complete"))
              .catch((error) => this.validatorService.showError(error)); 
        })
        .catch((error) => error instanceof Array ? this.validatorService.showErrors(error) : this.validatorService.showError(error));
      });
      
    }
}
