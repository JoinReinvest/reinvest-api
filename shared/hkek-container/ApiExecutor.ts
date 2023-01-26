import {ContainerInterface} from "Container/Container";

export type ApiRegistration = {
    [apiName: string]: (...args: any) => [className: string, method: string] | Function
};

export function executeApi<ApiType extends Object>(container: ContainerInterface, api: ApiRegistration): ApiType {
    const apiToExecute = {} as ApiType;
    for (const apiName of Object.keys(api)) {
        // @ts-ignore
        const callback = api[apiName] as Function;
        const registration = callback();
        if (typeof registration === 'function') {
            // @ts-ignore
            apiToExecute[apiName] = registration;
        } else {
            const [className, method] = registration;
            const controller = container.getValue(className);
            // @ts-ignore
            apiToExecute[apiName] = async function () {
                return controller[method](...arguments);
            }
        }

    }

    return apiToExecute as ApiType;
}
