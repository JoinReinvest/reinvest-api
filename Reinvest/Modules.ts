export default class Modules {
  private modules = {};

  register<Module>(moduleName: string, module: Module): void {
    // @ts-ignore
    this.modules[moduleName] = module;
  }

  get<Module>(moduleName: string): Module {
    // @ts-ignore
    return this.modules[moduleName];
  }
}
