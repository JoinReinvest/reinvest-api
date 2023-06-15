import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { LAMBDA_CONFIG } from 'Reinvest/config';

export function selfInvoker(functionName: string): (payload: any) => Promise<any> {
  const lambdaConfig = { region: LAMBDA_CONFIG.region };

  if (LAMBDA_CONFIG.isLocal) {
    // @ts-ignore
    lambdaConfig.endpoint = 'http://localhost:3002';
  }

  const client = new LambdaClient(lambdaConfig);

  return async (payload: any): Promise<any> => {
    const command = new InvokeCommand({
      FunctionName: functionName,
      InvocationType: 'Event',
      // @ts-ignore
      Payload: JSON.stringify(payload),
    });

    return client.send(command);
  };
}
