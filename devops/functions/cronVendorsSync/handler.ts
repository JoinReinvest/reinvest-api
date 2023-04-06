import {boot} from "Reinvest/bootstrap";
import {InvokeCommand, LambdaClient} from "@aws-sdk/client-lambda";
import {LAMBDA_CONFIG} from "Reinvest/config";
import {Registration} from "Reinvest/Registration/src";

export const main = async (event: any, context: any, callback: Function) => {
    if (event.syncId) {
        await synchronizeObject(event.syncId);
    } else {
        await invokeSynchronization(context.functionName)
    }

    callback(null, event);
};

async function synchronizeObject(id: string) {
    console.log(`[START] Syncing object ${id}`);
    const modules = boot();
    const registrationApi = modules.getApi<Registration.ApiType>(Registration);
    const vendorsSynchronizationStatus = await registrationApi.synchronize(id);
    console.log(`[END] Syncing object ${id} - ${vendorsSynchronizationStatus}`);
}

async function invokeSynchronization(functionName: string) {
    const modules = boot();

    const registrationApi = modules.getApi<Registration.ApiType>(Registration);
    const objectIds = await registrationApi.listObjectsToSync();
    if (objectIds.length === 0) {
        return;
    }

    const lambdaConfig = {region: LAMBDA_CONFIG.region};
    if (LAMBDA_CONFIG.isLocal) {
        // @ts-ignore
        lambdaConfig.endpoint = "http://localhost:3002";
    }
    const client = new LambdaClient(lambdaConfig);
    const invoker = selfInvoker(client, functionName);
    for (const id of objectIds) {
        await invoker(id);
    }
}

function selfInvoker(client: LambdaClient, functionName: string): Function {
    return async (syncId: string): Promise<any> => {
        const command = new InvokeCommand({
            FunctionName: functionName,
            InvocationType: "Event",
            // @ts-ignore
            Payload: JSON.stringify({syncId}),
        });
        return client.send(command);
    }
}
