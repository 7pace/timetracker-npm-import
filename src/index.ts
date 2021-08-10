#!/usr/bin/env node
import "reflect-metadata";
import { Container } from 'inversify';
import { CLI } from './cli';
import { ValidatorService } from './services/validatorservice';
import { APIService } from './services/apiservice'
import { DataService } from './services/dataservice';

export function index()  {
    const container = new Container();
    container.bind<ValidatorService>('ValidatorService').to(ValidatorService).inSingletonScope();
    container.bind<APIService>('APIService').to(APIService).inSingletonScope();
    container.bind<DataService>('DataService').to(DataService).inSingletonScope();
    container.bind<CLI>('CLI').to(CLI).inSingletonScope();
    return container.get<CLI>('CLI');
}

index();