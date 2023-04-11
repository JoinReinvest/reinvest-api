import { createInjector, Injector } from 'typed-inject';

export interface NameProvider {
  getClassName: () => string;
}

export interface ContainerInterface {
  addAsValue(token: string, constant: any): this;

  addObjectFactory(classObject: string | NameProvider, factory: Function, injectDependencies: (string | NameProvider)[]): this;

  addSingleton(singletonClass: NameProvider, injectDependencies?: (string | NameProvider)[]): this;

  delegateTo(tokenizedClass: NameProvider, methodName: string): any;

  getClass<T>(classObject: NameProvider): T;

  getValue<T>(token: string): T;
}

class Container implements ContainerInterface {
  private container: Injector;

  constructor() {
    this.container = createInjector();
  }

  getClass<T>(classObject: NameProvider): T {
    return this.getValue(classObject.getClassName());
  }

  getValue(token: string) {
    return this.container.resolve(token);
  }

  addAsValue(token: string, constant: any): this {
    this.container = this.container.provideValue(token, constant);

    return this;
  }

  /**
   * Do not use it when you must use the same class more than once, so the class is a Singleton.
   * Information about dependencies is injected directly to the class using the STATIC "inject" property.
   * Global classes from shared modules are also affected!
   * @param singletonClass
   * @param injectDependencies
   */
  addSingleton(singletonClass: NameProvider, injectDependencies: (string | NameProvider)[] = []): this {
    const token = singletonClass.getClassName();

    singletonClass.inject = this.getTokensToInject(injectDependencies);

    this.container = this.container.provideClass(token, singletonClass);

    return this;
  }

  /**
   * Use it when you must use the same class more than once, so the class is NOT a Singleton.
   * Information about dependencies is injected directly to the class using the STATIC "inject" property.
   * @param classObject
   * @param factory
   * @param injectDependencies
   */
  addObjectFactory(classObject: string | NameProvider, factory: Function, injectDependencies: (string | NameProvider)[] = []): this {
    const token = typeof classObject === 'string' ? classObject : classObject.getClassName();

    factory.inject = this.getTokensToInject(injectDependencies);

    this.container = this.container.provideFactory(token, factory);

    return this;
  }

  delegateTo(tokenizedClass: NameProvider, methodName: string): any {
    const containerSelf = this;

    return async function () {
      const controller = containerSelf.getValue(tokenizedClass.getClassName()) as Object;

      return controller[methodName](...arguments);
    };
  }

  private getTokensToInject(injectDependencies: (string | NameProvider)[] = []): string[] {
    const tokensToInject = [];

    for (const tokenToInject of injectDependencies) {
      if (typeof tokenToInject === 'string') {
        tokensToInject.push(tokenToInject);
      } else if ('getClassName' in tokenToInject) {
        tokensToInject.push(tokenToInject.getClassName());
      }
    }

    return tokensToInject;
  }
}

export default Container;
