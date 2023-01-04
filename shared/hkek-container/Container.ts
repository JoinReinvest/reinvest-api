import {createInjector, Injector} from 'typed-inject';

export interface ContainerInterface {
    addAsValue(token: string, constant: any): this;

    addClass(classObject: any, injectTokens?: string[]): this;

    getValue(token: string): any;

    getClass(classObject: any): any;
}

class Container implements ContainerInterface {
    private container: Injector;

    constructor() {
        this.container = createInjector();
    }

    getClass<T extends typeof toString>(classObject: T): T {
        return this.getValue(classObject.toString());
    }

    getValue(token: string) {
        // @ts-ignore
        return this.container.resolve(token);
    }

    addAsValue(token: string, constant: any): this {
        this.container = this.container.provideValue(token, constant);

        return this;
    }

    addClass(classObject: any, injectTokens: string[] = []): this {
        const token = classObject.toString();
        classObject.inject = injectTokens;
        this.container = this.container.provideClass(token, classObject);

        return this;
    }
}

export default Container;