import {MigrationManager} from "PostgreSQL/MigrationManager";

export type Api = { [apiName: string]: Function };
export type EventHandler = { [kind: string]: (event: any) => void};


export interface Module {
    api(): Api;

    isHandleEvent(kind: string): boolean;

    technicalEventHandler(): EventHandler;

    migration(): any
}

export interface ModuleNamespace {
    moduleName: string;
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

    getApi<ApiType>(namespace: ModuleNamespace): ApiType {
        const module = this.get(namespace.moduleName);
        return module.api() as ApiType;
    }
}