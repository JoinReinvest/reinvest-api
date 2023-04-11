export type Api = { [apiName: string]: Function };
export type EventHandler = { [kind: string]: (event: any) => void };

export interface Module {
  api(): Api;

  close(): Promise<void>;

  isHandleEvent(kind: string): boolean;

  migration(): any;

  technicalEventHandler(): EventHandler;
}

export interface ModuleNamespace {
  moduleName: string;
}

export default class Modules {
  private modules: {
    [moduleName: string]: Module;
  } = {};

  register(moduleName: string, module: Module): void {
    this.modules[moduleName] = module;
  }

  get(moduleName: string): Module {
    return this.modules[moduleName];
  }

  *iterate(): Iterable<Module> {
    const modulesNames = Object.keys(this.modules);

    for (const moduleName of modulesNames) {
      yield this.modules[moduleName];
    }
  }

  getApi<ApiType>(namespace: ModuleNamespace): ApiType {
    const module = this.get(namespace.moduleName);

    return module.api() as ApiType;
  }

  async close() {
    const modulesNames = Object.keys(this.modules);

    for (const moduleName of modulesNames) {
      const module = this.modules[moduleName];
      await module.close();
    }
  }
}
