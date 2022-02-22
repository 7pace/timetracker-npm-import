"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var inversify_1 = require("inversify");
var fs = __importStar(require("fs"));
var authtype_1 = require("../models/authtype");
var colors = require("colors");
var config = require('../../config.json');
var ValidatorService = /** @class */ (function () {
    function ValidatorService() {
    }
    ValidatorService.prototype.showSuccess = function (message) {
        console.log(colors.green(message));
    };
    ValidatorService.prototype.showError = function (error) {
        console.error(colors.red(error));
    };
    ValidatorService.prototype.showErrors = function (errors) {
        for (var index = 0; index < errors.length; index++) {
            console.error(colors.red(errors[index]));
        }
    };
    ValidatorService.prototype.validate = function (program) {
        var errorsExist = false;
        if (!program.file) {
            this.showError('File is not specified');
            errorsExist = true;
        }
        else {
            try {
                if (!fs.existsSync(program.file)) {
                    this.showError("File \"" + program.file + "\" does not exist.");
                    errorsExist = true;
                }
                else {
                    var extFile = program.file.split('.').pop().toLowerCase();
                    if (!(extFile === "xlsx" || extFile === "xls" || extFile === "csv")) {
                        this.showError("File \"" + program.file + "\" is not in supported format(xlsx/xls/csv).");
                        errorsExist = true;
                    }
                }
            }
            catch (error) {
                this.showError(error);
                errorsExist = true;
            }
        }
        if (!(program.authorization.toLowerCase() in authtype_1.AuthType)) {
            this.showError('Unknown API authorization type. Supported types: "token", "ntlm"');
            errorsExist = true;
        }
        if (!config.map && !program.map) {
            this.showError("Map is not specified in config.json");
            errorsExist = true;
        }
        if (program.authorization.toLowerCase() == authtype_1.AuthType.ntlm.valueOf() && (!program.api || !program.organization)) {
            this.showError("Api url and organization are not specified");
            errorsExist = true;
        }
        if (program.authorization.toLowerCase() == authtype_1.AuthType.token.valueOf() && !program.token) {
            if (!config.organizationTokens || config.organizationTokens.length === 0) {
                this.showError("Token is not specified, and organizationTokens not specified in config.json");
                errorsExist = true;
            }
        }
        if (program.authorization.toLowerCase() == authtype_1.AuthType.ntlm.valueOf() && (!program.user || !program.password)) {
            this.showError("User and password are not specified");
            errorsExist = true;
        }
        return errorsExist;
    };
    ValidatorService = __decorate([
        inversify_1.injectable(),
        __metadata("design:paramtypes", [])
    ], ValidatorService);
    return ValidatorService;
}());
exports.ValidatorService = ValidatorService;
