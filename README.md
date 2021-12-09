# timetracker-npm-import

__timetracker-npm-import__ is a Node.js CLI for importing worklogs(csv/excel) to 7pace Timetracker

## Install

You can install __timetracker-npm-import__ using the Node Package Manager (npm):

    npm install timetracker-npm-import -g

To build the application locally, you need to get the code from the repository and run the commands in the source folder:

    npm install
	npm run create

## How to use

First of all, you need to decide on the format of the imported files. Import supports file extensions: xlsx, xls, csv.

To compare the values from the table in the file and the data sent to api, mapping of columns into fields is necessary.

There are two options:
1. Describe the matching of the names of fields and columns in a file using the json that is defined in the file config.json
```json
   "map": {
        "userName": "A",
        "timeStamp": "B", 
        "duration": "C",
        "billableDuration": "G",  
        "activityType": "D", 
        "comment": "E", 
        "workItem": "F"
    }
```
2.  Specify field names in the first row of the table in the file(if you chose this option, you must pass the "--map" parameter to the command console)

| UserName  | TimeStamp  | Duration  | ActivityType  | Comment  | WorkItem  | BillableDuration  |
| ------------ | ------------ | ------------ | ------------ | ------------ | ------------ | ------------ |
|   | 05.29.2021 10:12  | 2.13  | Development  | Test comment  | 22  | 1.13  |
| test@mail.com  | 05.29.2021 17:43  | 1.5  | Daily  |   | 33  |  1 |

**The TimeStamp field currently only accepts the US time and date formats such as mm.dd.yyyy hh:mm and mm/dd/yyyy hh:mm*

**Description of fields used**

- UserName - User to whom worklog is created. If not specified - it will be created to current user
- TimeStamp - Start date and time of worklog in the US timezone format.
- Duration - Duration of worklog in hours
- BillableDuration - Billable duration of worklog in hours. Only use it when billable lenght should be different from actual
- ActivityType - Activity type to set to worklog. If not specified - default activity type for user of worklog will be used
- Comment - Comment for worklog. Must be set if "WorkItem" null
- WorkItem - Work Item upon time was tracked. Must be set if "Comment" null

**The command with the necessary parameters**
```console
Usage: import-worklogs [options]

CLI for importing worklogs(csv/excel)

Options:
  -V, --version                        output the version number
  -f, --file <file>                    File path for importing(csv/excel)
  -a, --authorization [authorization]  API authorization type (token or ntlm). Default value is "token" (default: "token")
  -o, --organization <organization>    The name of your organization in Azure DevOps or collection in On-premise version
  --api [api]                          The api url. This option is required for import to On-premise
  -t, --token [token]                  Reporting API Access Token. This option is required for import to Azure DevOps
  -u, --user [user]                    NTLM authorization username. This option is required for import import to On-premise version
  -p, --password [password]            NTLM authorization password. This option is required for import to On-premise version)
  -m, --map                            Mapping worklog fields from column names(first row in Excel file) (default: false)
  -h, --help                           output usage information
```

**Command invocation examples**

Call command on the command line for the cloud version of Azure DevOps

```console
import-worklogs -f "C:\WorkLogs\sample data.xlsx" -o "{organization name}" --api "https://{organization name}.timehub.7pace.com" -t "{token value}" -a "token"
```
In the cloud version, it is important to set the authentication type "token" and set the token parameter.

Call command on the command line for the on-prem version of Azure DevOps

```console
import-worklogs -f "C:\WorkLogs\sample data.xlsx" -u "test@mail.com" -p "MyPassword123" -o "DefaultCollection" --api "http://test-2021.your-organization.local:8090" -m -a "ntlm"
```
For the on-prem version, it is necessary to set the ntlm authorization type and be sure to pass the api and organization parameters, they are necessary for generating api requests. In order for NTLM authorization to work, you must also provide a login (user) and password.
