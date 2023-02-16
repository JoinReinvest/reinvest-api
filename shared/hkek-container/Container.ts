import {createInjector, Injector} from 'typed-inject';

export interface NameProvider {
    getClassName: () => string
}

export interface ContainerInterface {
    addAsValue(token: string, constant: any): this;

    addClass(classObject: NameProvider, injectDependencies?: (string|NameProvider)[]): this;

    addClassOfType<ClassType>(classObject: NameProvider, injectDependencies?: (string|NameProvider)[]): this;

    getValue<T>(token: string): T;

    getClass<T>(classObject: NameProvider): T;

    delegateTo(tokenizedClass: NameProvider, methodName: string): any
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
        // @ts-ignore
        return this.container.resolve(token);
    }

    addAsValue(token: string, constant: any): this {
        this.container = this.container.provideValue(token, constant);

        return this;
    }

    addClass(classObject: NameProvider, injectDependencies: (string|NameProvider)[] = []): this {
        const token = classObject.getClassName();
        const tokensToInject = [];
        for (const tokenToInject of injectDependencies) {
            if (typeof tokenToInject === 'string') {
                tokensToInject.push(tokenToInject);
            } else if ('getClassName' in tokenToInject) {
                tokensToInject.push(tokenToInject.getClassName());
            }
        }
        // @ts-ignore
        classObject.inject = tokensToInject;
        // @ts-ignore
        this.container = this.container.provideClass(token, classObject);

        return this;
    }

    addClassOfType<ClassType>(classObject: NameProvider, injectDependencies: (string|NameProvider)[] = []): this {
        const token = classObject.getClassName();
        const tokensToInject = [];
        for (const tokenToInject of injectDependencies) {
            if (typeof tokenToInject === 'string') {
                tokensToInject.push(tokenToInject);
            } else if ('getClassName' in tokenToInject) {
                tokensToInject.push(tokenToInject.getClassName());
            }
        }
        // @ts-ignore
        classObject.inject = tokensToInject;
        // @ts-ignore
        this.container = this.container.provideClass(token, classObject<ClassType>);

        return this;
    }

    delegateTo(tokenizedClass: NameProvider, methodName: string): any {
        const containerSelf = this;
        return async function () {
            const controller = containerSelf.getValue(tokenizedClass.getClassName()) as Object;
            // @ts-ignore
            return controller[methodName](...arguments);
        }
    }
}

export default Container;