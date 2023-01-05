import {MigrationManager} from "PostgreSQL/MigrationManager";

export interface Module {
    api(): { [apiName: string]: Function }

    isHandleEvent(kind: string): boolean;

    technicalEventHandler(): { [eventKind: string]: Function }

    migration(): MigrationManager
}

export default class Modules {
    private modules: {
        [moduleName: string]: Module
    } = {};

    register(moduleName: string, module: Module): void {
        this.modules[moduleName] = module;
    }

    get(moduleName: string): Module {
        return this.modules[moduleName];
    }

    * iterate(): Iterable<Module> {
        const modulesNames = Object.keys(this.modules);
        for (let moduleName of modulesNames) {
            yield this.modules[moduleName];
        }
    }
}
