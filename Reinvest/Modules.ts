export default class Modules {
    private modules = {};

    register<Module>(moduleName: string, module: Module): void {
        // @ts-ignore
        this.modules[moduleName] = module;
    }

    get<Module>(moduleName: string): Module { // TODO add Module interface!!!
        // @ts-ignore
        return this.modules[moduleName];
    }

    * iterate(): Iterable<any> {
        const modulesNames = Object.keys(this.modules);
        for (let moduleName of modulesNames) {
            // @ts-ignore
            yield this.modules[moduleName];
        }
    }
}
