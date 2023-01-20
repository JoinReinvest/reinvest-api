export class InputParameters {
    private inputParameters: any;

    public constructor(inputParameters: { [parameterName: string]: any }) {
        this.inputParameters = inputParameters;
    }
}