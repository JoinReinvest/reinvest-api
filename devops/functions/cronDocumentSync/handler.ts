import {boot} from "Reinvest/bootstrap";
import {InvokeCommand, LambdaClient} from "@aws-sdk/client-lambda";
import {LAMBDA_CONFIG} from "Reinvest/config";
import {Registration} from "Reinvest/Registration/src";

export const main = async (event: any, context: any, callback: Function) => {
    if (event.syncDocumentId) {
        await synchronizeDocument(event.syncDocumentId);
    } else {
        await invokeSynchronization(context.functionName)
    }

    callback(null, event);
};

async function synchronizeDocument(documentId: string) {
    console.log(`[START] Syncing document with North Capital ${documentId}`);
    const modules = boot();
    const registrationApi = modules.getApi<Registration.ApiType>(Registration);
    const documentSynchronizationStatus = await registrationApi.synchronizeDocument(documentId);
    console.log(`[END] Syncing document with North Capital ${documentId} - ${documentSynchronizationStatus}`);
}

async function invokeSynchronization(functionName: string) {
    const modules = boot();

    const registrationApi = modules.getApi<Registration.ApiType>(Registration);
    const documentIds = await registrationApi.listDocumentsToSynchronize();
    if (documentIds.length === 0) {
        return;
    }

    const lambdaConfig = {region: LAMBDA_CONFIG.region};
    if (LAMBDA_CONFIG.isLocal) {
        lambdaConfig.endpoint = "http://localhost:3002";
    }
    const client = new LambdaClient(lambdaConfig);
    const invoker = selfInvoker(client, functionName);
    for (const documentId of documentIds) {
        await invoker(documentId);
    }
}

function selfInvoker(client: LambdaClient, functionName: string): Function {
    return async (syncDocumentId: string): Promise<any> => {
        const command = new InvokeCommand({
            FunctionName: functionName,
            InvocationType: "Event",
            Payload: JSON.stringify({syncDocumentId}),
        });
        return client.send(command);
    }
}
