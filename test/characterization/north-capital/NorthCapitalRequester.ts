import axios, {AxiosResponse} from 'axios';
import FormData from 'form-data';
import NorthCapitalException from "../NorthCapitalException";

export default class NorthCapitalRequester {
    clientId: string;
    developerAPIKey: string;
    url: string;

    constructor(clientId: string, developerAPIKey: string, url: string) {
        this.clientId = clientId;
        this.developerAPIKey = developerAPIKey;
        this.url = url
    }

    private async postRequest(endpoint: string, data: any): Promise<any> {
        try {
            const formData = this.transformToFormData(data);
            const response: AxiosResponse = await axios
                .post(`${this.url}/${endpoint}`, formData);

            return response.data;
        } catch (error) {
            const {response: {data: {statusCode, statusDesc}}} = error;
            throw new NorthCapitalException(statusCode, statusDesc);
        }
    }

    private transformToFormData(data: any): FormData {
        const formData = new FormData();
        formData.append('clientID', this.clientId);
        formData.append('developerAPIKey', this.developerAPIKey);

        for (const key of Object.keys(data)) {
            formData.append(key, data[key]);
        }

        return formData;
    }

    public async linkExternalAchAccount(accountId: string): Promise<string> {
        const endpoint = 'tapiv3/index.php/v3/linkExternalAccount';
        const data = {
            accountId
        };

        const {statusCode, statusDesc, accountDetails: integrationLink} = await this.postRequest(endpoint, data);

        return integrationLink;
    }

    async createExternalAchAccount(id: string,
                                   fullName: string,
                                   nickName: string,
                                   bankName: string,
                                   bankRoutingNumber: string,
                                   bankAccountNumber: string,
                                   ipAddress: string,
                                   type: 'Issuer Account' | 'Account' = 'Account',
                                   accountType: 'Checking' | 'Saving' = 'Checking'
    ): Promise<boolean> {
        const endpoint = 'tapiv3/index.php/v3/createExternalAccount';
        const accountIdKey = type === 'Account' ? 'accountId' : 'issuerId';
        const data = {
            [accountIdKey]: id,
            types: type,
            ExtAccountfullname: fullName,
            ExtRoutingnumber: bankRoutingNumber,
            ExtAccountnumber: bankAccountNumber,
            Extnickname: nickName,
            ExtBankname: bankName,
            updatedIpAddress: ipAddress,
            accountType
        };
        let statusCode;
        try {
            const response = await this.postRequest(endpoint, data);
            statusCode = response.statusCode;
        } catch (error: NorthCapitalException | any) {
            statusCode = error.getStatus();
        }

        return statusCode === 101;
    }
}