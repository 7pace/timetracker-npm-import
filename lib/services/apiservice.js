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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
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
var axios_1 = __importDefault(require("axios"));
var util = __importStar(require("util"));
var authtype_1 = require("../models/authtype");
var config = require('../../config.json');
var httpntlm = require('httpntlm');
var httpntlmGetAsync = util.promisify(httpntlm.get);
var httpntlmPostAsync = util.promisify(httpntlm.post);
var APIService = /** @class */ (function () {
    function APIService() {
        this.apiVersion = "3.0-preview";
    }
    APIService.prototype.getUsers = function (apiUrl, auth, token, organization, user, password) {
        return __awaiter(this, void 0, void 0, function () {
            var users, response, opt, res, index, user_1, uniqueName, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        users = new Map();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        if (!(auth == authtype_1.AuthType.token)) return [3 /*break*/, 3];
                        opt = { headers: { 'Authorization': "Bearer " + token }, params: { 'api-version': this.apiVersion } };
                        return [4 /*yield*/, axios_1.default.get(apiUrl + '/api/rest/users', opt)];
                    case 2:
                        response = (_a.sent()).data;
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, httpntlmGetAsync({
                            url: apiUrl + ("/api/" + organization + "/rest/users?api-version=" + this.apiVersion),
                            username: user,
                            password: password
                        })];
                    case 4:
                        res = _a.sent();
                        response = JSON.parse(res.body);
                        if (res.statusCode < 200 || res.statusCode > 299)
                            throw response.error;
                        _a.label = 5;
                    case 5:
                        if (response.data && Array.isArray(response.data)) {
                            for (index = 0; index < response.data.length; index++) {
                                user_1 = response.data[index];
                                if (user_1) {
                                    uniqueName = auth == authtype_1.AuthType.ntlm ? user_1.uniqueName.replace("\\", "\\\\") : user_1.uniqueName;
                                    if (uniqueName && !users.has(uniqueName)) {
                                        users.set(uniqueName, user_1.id);
                                    }
                                }
                            }
                        }
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _a.sent();
                        if (error_1.response && error_1.response.data.error)
                            throw error_1.response.data.error;
                        else if (error_1.message)
                            throw error_1.message;
                        else
                            throw error_1;
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/, users];
                }
            });
        });
    };
    APIService.prototype.getActivityTypes = function (apiUrl, auth, token, organization, user, password) {
        return __awaiter(this, void 0, void 0, function () {
            var activityTypes, response, opt, res, index, activityType, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        activityTypes = new Map();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        if (!(auth == authtype_1.AuthType.token)) return [3 /*break*/, 3];
                        opt = { headers: { 'Authorization': "Bearer " + token }, params: { 'api-version': this.apiVersion } };
                        return [4 /*yield*/, axios_1.default.get(apiUrl + '/api/rest/activityTypes', opt)];
                    case 2:
                        response = (_a.sent()).data;
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, httpntlmGetAsync({
                            url: apiUrl + ("/api/" + organization + "/rest/activityTypes?api-version=" + this.apiVersion),
                            username: user,
                            password: password
                        })];
                    case 4:
                        res = _a.sent();
                        response = JSON.parse(res.body);
                        if (res.statusCode < 200 || res.statusCode > 299)
                            throw response.error;
                        _a.label = 5;
                    case 5:
                        if (response.data.activityTypes && Array.isArray(response.data.activityTypes)) {
                            for (index = 0; index < response.data.activityTypes.length; index++) {
                                activityType = response.data.activityTypes[index];
                                if (activityType && activityType.name && !activityTypes.has(activityType.name)) {
                                    activityTypes.set(activityType.name, activityType.id);
                                }
                            }
                        }
                        return [3 /*break*/, 7];
                    case 6:
                        error_2 = _a.sent();
                        if (error_2.response && error_2.response.data.error)
                            throw error_2.response.data.error;
                        else if (error_2.message)
                            throw error_2.message;
                        else
                            throw error_2;
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/, activityTypes];
                }
            });
        });
    };
    APIService.prototype.postWorklogsBatch = function (worklogs, validateOnly, apiUrl, auth, token, organization, user, password) {
        return __awaiter(this, void 0, void 0, function () {
            var batchesCount, opt, url, index, batch, res, index, batch, resp, response, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        batchesCount = Math.ceil(worklogs.length / 500);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 11, , 12]);
                        if (!(auth == authtype_1.AuthType.token)) return [3 /*break*/, 6];
                        opt = { headers: { 'Authorization': "Bearer " + token, 'Content-Type': 'application/json' }, params: { 'api-version': this.apiVersion, 'validateOnly': validateOnly }, };
                        url = apiUrl + '/api/rest/workLogs/batch';
                        index = 0;
                        _a.label = 2;
                    case 2:
                        if (!(index < batchesCount)) return [3 /*break*/, 5];
                        batch = worklogs.slice(index * 500, (index + 1) * 500);
                        return [4 /*yield*/, axios_1.default.post(url, batch, opt)];
                    case 3:
                        res = _a.sent();
                        _a.label = 4;
                    case 4:
                        index++;
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 10];
                    case 6:
                        index = 0;
                        _a.label = 7;
                    case 7:
                        if (!(index < batchesCount)) return [3 /*break*/, 10];
                        batch = worklogs.slice(index * 500, (index + 1) * 500);
                        return [4 /*yield*/, httpntlmPostAsync({
                                url: apiUrl + ("/api/" + organization + "/rest/workLogs/batch?api-version=" + this.apiVersion + "&validateOnly=" + validateOnly),
                                username: user,
                                password: password,
                                body: JSON.stringify(batch),
                                headers: { 'Content-Type': 'application/json' }
                            })];
                    case 8:
                        resp = _a.sent();
                        response = JSON.parse(resp.body);
                        if (resp.statusCode < 200 || resp.statusCode > 299)
                            throw response.error;
                        _a.label = 9;
                    case 9:
                        index++;
                        return [3 /*break*/, 7];
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        error_3 = _a.sent();
                        if (error_3.response && error_3.response.data.error)
                            throw error_3.response.data.error;
                        else if (error_3.message)
                            throw error_3.message;
                        else
                            throw error_3;
                        return [3 /*break*/, 12];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    APIService = __decorate([
        inversify_1.injectable(),
        __metadata("design:paramtypes", [])
    ], APIService);
    return APIService;
}());
exports.APIService = APIService;
