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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var XLSX = __importStar(require("xlsx"));
var apiservice_1 = require("../services/apiservice");
var config = require('../../config.json');
var DataService = /** @class */ (function () {
    function DataService(apiService) {
        this.apiService = apiService;
    }
    DataService.prototype.getMappingData = function (file, columnsFromExcel, apiUrl, defaultOrganization) {
        var result = new Map();
        var errors = new Array();
        var wb = XLSX.readFile(file);
        var sheet_name_list = wb.SheetNames;
        var opt = columnsFromExcel ? { raw: false } : { header: "A", raw: false };
        var xlData = XLSX.utils.sheet_to_json(wb.Sheets[sheet_name_list[0]], opt);
        var map = columnsFromExcel
            ? { userName: 'UserName', workItem: 'WorkItem', timeStamp: 'TimeStamp', duration: 'Duration',
                billableDuration: 'BillableDuration', comment: 'Comment', activityType: 'ActivityType',
                date: 'Date', start: 'Start', organization: 'Organization' }
            : config.map;
        var addIndex = columnsFromExcel ? 2 : 1;
        var requireOrganization = !apiUrl;
        for (var index = 0; index < xlData.length; index++) {
            var element = xlData[index];
            var workLog = {};
            if (map.userName && element[map.userName]) {
                workLog.userId = element[map.userName];
            }
            if (map.workItem && element[map.workItem]) {
                var number = Number(element[map.workItem]);
                if (!isNaN(number) && Number.isInteger(number) && number > 0)
                    workLog.workItemId = number;
                else
                    errors.push("\"WorkItem\" is not a valid value in a cell " + map.workItem + (index + addIndex) + ". The value may be not specified or must be an integer and greater than 0.");
            }
            if (map.timeStamp && element[map.timeStamp]) {
                var date = Date.parse(element[map.timeStamp]);
                if (!isNaN(date))
                    workLog.timeStamp = new Date(date).toLocaleString();
                else
                    errors.push("\"TimeStamp\" is not a valid datetime value in a cell " + map.timeStamp + (index + addIndex) + ".");
            }
            else {
                if (map.date && element[map.date]) {
                    var timestamp = element[map.date];
                    if (map.start && element[map.start]) {
                        timestamp += " " + element[map.start];
                    }
                    else {
                        timestamp += " 9:00 AM";
                    }
                    var date = Date.parse(timestamp);
                    if (!isNaN(date)) {
                        workLog.timeStamp = new Date(date).toLocaleString();
                    }
                    else {
                        errors.push("\"Date\" and \"Start\" do not specify a valid starting datetime value \"" + timestamp + "\" in a cell(s) " + map.date + (index + addIndex) + ".");
                    }
                }
            }
            if (map.duration && element[map.duration]) {
                var number = Number(element[map.duration].replace(/,/g, '.'));
                if (!isNaN(number) && number > 0)
                    workLog.length = Math.ceil(number * 3600);
                else
                    errors.push("\"Duration\" is not a valid value in a cell " + map.duration + (index + addIndex) + ". The value may be not specified or must be greater than 0.");
            }
            if (map.billableDuration && element[map.billableDuration]) {
                var number = Number(element[map.billableDuration].replace(/,/g, '.'));
                if (!isNaN(number) && number >= 0)
                    workLog.billableLength = Math.ceil(number * 3600);
                else
                    errors.push("\"BillableDuration\" is not a valid value in a cell " + map.billableDuration + (index + addIndex) + ". The value may be not specified or must be greater or equal than 0.");
            }
            if (map.activityType && element[map.activityType]) {
                workLog.activityTypeId = element[map.activityType];
            }
            if (map.comment && element[map.comment]) {
                workLog.comment = element[map.comment];
            }
            if ((!workLog.comment || workLog.comment.trim() === '') && !workLog.workItemId) {
                errors.push("\"Comment\" (cell " + map.comment + (index + addIndex) + ") and \"WorkItem\" (cell " + map.workItem + (index + addIndex) + ") are not specified. At least one of these values must be specified.");
            }
            var mapKey = void 0;
            if (map.organization && element[map.organization] && element[map.organization] !== '') {
                mapKey = element[map.organization];
            }
            else if (requireOrganization) {
                if (!defaultOrganization || defaultOrganization.trim() === '') {
                    errors.push("\"Organization\" (cell " + map.comment + (index + addIndex) + ") and -o / --organization <organization> command line parameter are not specified. At least one of these values must be specified.");
                    continue;
                }
                else {
                    mapKey = defaultOrganization;
                }
            }
            else {
                mapKey = apiUrl;
            }
            if (mapKey) {
                mapKey = mapKey.toLowerCase();
            }
            var orgResult = result.get(mapKey);
            var organizationWorkLogs = orgResult ? orgResult : new Array();
            if (!result.has(mapKey)) {
                result.set(mapKey, organizationWorkLogs);
            }
            organizationWorkLogs.push(workLog);
        }
        if (errors.length > 0) {
            throw errors;
        }
        return result;
    };
    DataService.prototype.getUserIdActivityTypeId = function (worklogs, apiUrl, auth, token, organization, user, password) {
        return __awaiter(this, void 0, void 0, function () {
            var users, activityTypes, errors, index, worklog, err, err;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        users = new Map();
                        activityTypes = new Map();
                        if (!worklogs.some(function (w) { return w.userId; })) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.apiService.getUsers(apiUrl, auth, token, organization, user, password)];
                    case 1:
                        users = _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!worklogs.some(function (w) { return w.activityTypeId; })) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.apiService.getActivityTypes(apiUrl, auth, token, organization, user, password)];
                    case 3:
                        activityTypes = _a.sent();
                        _a.label = 4;
                    case 4:
                        errors = new Set();
                        for (index = 0; index < worklogs.length; index++) {
                            worklog = worklogs[index];
                            if (worklog.userId) {
                                if (users.has(worklog.userId)) {
                                    worklog.userId = users.get(worklog.userId);
                                }
                                else {
                                    err = "User \"" + worklog.userId + "\" does not exist in your organization";
                                    if (!errors.has(err))
                                        errors.add(err);
                                }
                            }
                            if (worklog.activityTypeId) {
                                if (activityTypes.has(worklog.activityTypeId)) {
                                    worklog.activityTypeId = activityTypes.get(worklog.activityTypeId);
                                }
                                else {
                                    err = "Activity type \"" + worklog.activityTypeId + "\" does not exist in your organization";
                                    if (!errors.has(err))
                                        errors.add(err);
                                }
                            }
                        }
                        if (errors.size > 0) {
                            throw Array.from(errors);
                        }
                        return [2 /*return*/, worklogs];
                }
            });
        });
    };
    DataService.prototype.sendWorklogs = function (worklogs, apiUrl, auth, token, organization, user, password) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.apiService.postWorklogsBatch(worklogs, true, apiUrl, auth, token, organization, user, password)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.apiService.postWorklogsBatch(worklogs, false, apiUrl, auth, token, organization, user, password)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DataService = __decorate([
        inversify_1.injectable(),
        __param(0, inversify_1.inject('APIService')),
        __metadata("design:paramtypes", [apiservice_1.APIService])
    ], DataService);
    return DataService;
}());
exports.DataService = DataService;
