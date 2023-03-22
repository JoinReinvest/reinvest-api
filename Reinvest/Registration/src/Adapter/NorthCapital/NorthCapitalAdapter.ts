import axios, {AxiosResponse} from "axios";
import FormData from "form-data";
import NorthCapitalException from "Registration/Adapter/NorthCapital/NorthCapitalException";
import {MainParty} from "../../Domain/VendorModel/NorthCapital/MainParty";
import {DictionaryType} from "HKEKTypes/Generics";

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


    async createParty(mainParty: MainParty): Promise<string> {
        const endpoint = 'tapiv3/index.php/v3/createParty';
        const data = this.getPartyData(mainParty);
        const response = await this.putRequest(endpoint, data);
        const {statusCode, statusDesc, partyDetails: [status, [{partyId}]]} = response;
        console.log({action: "Create north capital party", partyId, statusCode, statusDesc});

        return partyId;
    }

    private getPartyData(mainParty: MainParty): DictionaryType {
        const rawData = mainParty.getData() as DictionaryType;
        const data = {} as DictionaryType
        for (const key of Object.keys(rawData)) {
            switch (key) {
                case 'middleInitial':
                case 'socialSecurityNumber':
                    if (rawData[key] && rawData[key].length > 0) {
                        data[key] = rawData[key];
                    }
                    break;
                case 'documents':
                    break;
                default:
                    data[key] = rawData[key];
                    break;
            }
        }

        return data;
    }

    async findParty(bySurname: string, andEmail: string): Promise<string | null> {
        const endpoint = 'tapiv3/index.php/v3/searchParty';
        const data = {
            searchKeyword: andEmail
        };

        try {
            const response = await this.postRequest(endpoint, data);
            const {statusCode, statusDesc, partyDetails} = response;
            const {partyId} = partyDetails.find(({emailAddress}: { emailAddress: string }) => emailAddress === andEmail);
            console.log({statusCode, statusDesc, partyId});
            return partyId ?? null;
        } catch (error: any) {
            console.log(`[NC] ${error.message} by surname ${bySurname} and email ${andEmail}`);
            return null;
        }
    }

    async updateParty(northCapitalId: string, mainParty: MainParty): Promise<void> {
        const endpoint = 'tapiv3/index.php/v3/updateParty';
        const data = {
            partyId: northCapitalId,
            ...this.getPartyData(mainParty)
        };

        const response = await this.postRequest(endpoint, data);
        const {statusCode, statusDesc, partyDetails: [status]} = response;
        console.log({action: "Update north capital party", northCapitalId, statusCode, statusDesc, status});
    }
}
