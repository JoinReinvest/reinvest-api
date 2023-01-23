import {ContainerInterface} from "Container/Container";

export type ApiRegistration = {
    [apiName: string]: (...args: any) => [className: string, method: string]
};

export function executeApi<ApiType extends Object>(container: ContainerInterface, api: ApiRegistration): ApiType {
    const apiToExecute = {};
    for (const apiName of Object.keys(api)) {
        // @ts-ignore
        const callback = api[apiName] as Function;
        const [className, method] = callback();
        const controller = container.getValue(className);
        // @ts-ignore
        apiToExecute[apiName] = async function () {
            controller[method](...arguments);
        }
    }

    return apiToExecute as ApiType;
}
