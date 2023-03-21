import axios, {AxiosResponse} from "axios";
import FormData from "form-data";
import NorthCapitalException from "Registration/Adapter/NorthCapital/NorthCapitalException";

export type NorthCapitalConfig = {
    CLIENT_ID: string,
    DEVELOPER_API_KEY: string,
    API_URL: string,
    OFFERING_ID: string,
}

export class NorthCapitalAdapter {
    static getClassName = () => 'NorthCapitalAdapter';
    clientId: string;
    developerAPIKey: string;
    url: string;

    constructor({CLIENT_ID: clientId, DEVELOPER_API_KEY: developerAPIKey, API_URL: url}: NorthCapitalConfig) {
        this.clientId = clientId;
        this.developerAPIKey = developerAPIKey;
        this.url = url
    }

    private async putRequest(endpoint: string, data: any): Promise<any> {
        try {
            const putData = this.extendWithCredentials(data);
            const response: AxiosResponse = await axios
                .put(`${this.url}/${endpoint}`, putData);

            return response.data;
        } catch (error) {
            // @ts-ignore
            const {response: {data: {statusCode, statusDesc}}} = error;
            throw new NorthCapitalException(statusCode, statusDesc);
        }
    }

    private async postRequest(endpoint: string, data: any): Promise<any> {
        try {
            const formData = this.transformToFormData(data);
            const response: AxiosResponse = await axios
                .post(`${this.url}/${endpoint}`, formData);

            return response.data;
        } catch (error) {
            // @ts-ignore
            const {response: {data: {statusCode, statusDesc}}} = error;
            throw new NorthCapitalException(statusCode, statusDesc);
        }
    }

    private transformToFormData(data: any): FormData {
        const extendedData = this.extendWithCredentials(data);
        const formData = new FormData();

        for (const key of Object.keys(extendedData)) {
            formData.append(key, extendedData[key]);
        }

        return formData;
    }

    private extendWithCredentials(data: any): any {
        return {
            clientID: this.clientId,
            developerAPIKey: this.developerAPIKey,
            ...data
        };
    }
}
