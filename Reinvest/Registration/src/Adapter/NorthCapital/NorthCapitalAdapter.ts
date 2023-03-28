import axios, {AxiosResponse} from "axios";
import FormData from "form-data";
import NorthCapitalException from "Registration/Adapter/NorthCapital/NorthCapitalException";
import {MainParty} from "../../Domain/VendorModel/NorthCapital/MainParty";
import {DictionaryType} from "HKEKTypes/Generics";
import {
    NorthCapitalIndividualExtendedMainPartyType,
    NorthCapitalIndividualAccountStructure, NorthCapitalLinkConfiguration
} from "Registration/Domain/VendorModel/NorthCapital/NorthCapitalTypes";
import {ExecutionNorthCapitalAdapter} from "Registration/Adapter/NorthCapital/ExecutionNorthCapitalAdapter";

export type NorthCapitalConfig = {
    CLIENT_ID: string,
    DEVELOPER_API_KEY: string,
    API_URL: string,
    OFFERING_ID: string,
}

export class NorthCapitalAdapter extends ExecutionNorthCapitalAdapter {
    static getClassName = () => 'NorthCapitalAdapter';

    async createParty(toCreate: DictionaryType): Promise<string | never> {
        const endpoint = 'tapiv3/index.php/v3/createParty';

        const response = await this.putRequest(endpoint, toCreate);
        const {statusCode, statusDesc, partyDetails: [status, [{partyId}]]} = response;
        console.log({action: "Create north capital party", partyId, statusCode, statusDesc});

        return partyId;
    }

    async updateParty(northCapitalId: string, toUpdate: DictionaryType): Promise<void | never> {
        const endpoint = 'tapiv3/index.php/v3/updateParty';
        const data = {
            partyId: northCapitalId,
            ...toUpdate,
        };

        const response = await this.postRequest(endpoint, data);
        const {statusCode, statusDesc, partyDetails: [status]} = response;
        console.log({action: "Update north capital party", northCapitalId, statusCode, statusDesc, status});
    }

    async getParty(partyId: string): Promise<object | never> {
        const endpoint = 'tapiv3/index.php/v3/getParty';

        const data = {
            partyId,
        }

        const response = await this.postRequest(endpoint, data);
        const {statusCode, statusDesc, partyDetails: [party]} = response;

        console.log({action: "Get north capital party", partyId, statusCode, statusDesc});
        return party;
    }

    async createAccount(toCreate: DictionaryType): Promise<string | never> {
        const endpoint = 'tapiv3/index.php/v3/createAccount';
        const data = {
            domesticYN: "domestic_account",
            KYCstatus: "Pending",
            AMLstatus: "Pending",
            AccreditedStatus: "Pending",
            approvalStatus: "Pending",
            ...toCreate,
        }

        const response = await this.putRequest(endpoint, data);
        const {statusCode, statusDesc, accountDetails: [{accountId}]} = response;

        console.log({action: "Create north capital individual account", accountId, statusCode, statusDesc});
        return accountId;
    }


    async updateAccount(northCapitalAccountId: string, accountData: DictionaryType): Promise<void | never> {
        const endpoint = 'tapiv3/index.php/v3/updateAccount';
        const data = {
            accountId: northCapitalAccountId,
            domesticYN: "domestic_account",
            approvalStatus: "Pending",
            ...accountData,
        }

        const response = await this.putRequest(endpoint, data);
        const {statusCode, statusDesc, accountDetails} = response;

        console.log({
            action: "Update north capital individual account",
            northCapitalAccountId,
            statusCode,
            statusDesc,
            accountDetails
        });
    }

    async linkEntityToAccount(entityId: string, accountId: string, linkConfiguration: NorthCapitalLinkConfiguration): Promise<string | never> {
        const endpoint = 'tapiv3/index.php/v3/createLink';
        const data = {
            firstEntryType: "Account",
            firstEntry: accountId,
            relatedEntry: entityId,
            ...linkConfiguration,
        }

        try {
            const response = await this.putRequest(endpoint, data);
            const {statusCode, statusDesc, linkDetails: [status, [{id: linkId}]]} = response;

            return linkId;
        } catch (error: any) {
            if (error.statusCode && error.statusCode == 206) {
                const existingLinks = await this.getAccountLinks(accountId);
                const existingLink = existingLinks.find(link => link.relatedEntry == entityId);
                if (!existingLink) {
                    throw new Error(error.message);
                }

                return existingLink.linkId;
            } else {
                throw new Error(error.message);
            }
        }
    }

    async getAccountLinks(northCapitalAccountId: string): Promise<{ linkId: string, relatedEntry: string }[]> {
        const endpoint = 'tapiv3/index.php/v3/getAllLinks';
        const data = {
            accountId: northCapitalAccountId,
        }

        try {
            const response = await this.postRequest(endpoint, data);
            const {linkDetails} = response;

            return linkDetails.map((link: any) => {
                return {
                    linkId: link.id,
                    relatedEntry: link.relatedEntry,
                }
            });
        } catch (error: any) {
            console.error(`Retrieve all links for North Capital account ${northCapitalAccountId} failed: ${error.message}`);
            return [];
        }
    }

    async getAccount(accountId: string) {
        const endpoint = 'tapiv3/index.php/v3/getAccount';

        const data = {
            accountId,
        }

        const response = await this.postRequest(endpoint, data);
        const {statusCode, statusDesc, accountDetails: account} = response;

        console.log({action: "Get north capital account", accountId, statusCode, statusDesc});

        return account;
    }
}