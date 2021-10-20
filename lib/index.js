#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.index = void 0;
require("reflect-metadata");
var inversify_1 = require("inversify");
var cli_1 = require("./cli");
var validatorservice_1 = require("./services/validatorservice");
var apiservice_1 = require("./services/apiservice");
var dataservice_1 = require("./services/dataservice");
function index() {
    var container = new inversify_1.Container();
    container.bind('ValidatorService').to(validatorservice_1.ValidatorService).inSingletonScope();
    container.bind('APIService').to(apiservice_1.APIService).inSingletonScope();
    container.bind('DataService').to(dataservice_1.DataService).inSingletonScope();
    container.bind('CLI').to(cli_1.CLI).inSingletonScope();
    return container.get('CLI');
}
exports.index = index;
index();
