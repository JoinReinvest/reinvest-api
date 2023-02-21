import {InvestmentAccounts} from "InvestmentAccounts/index";

export class ProfileService {
    public static getClassName = (): string => "ProfileService";
    private investmentAccounts: InvestmentAccounts.Main;


    constructor(investmentAccounts: InvestmentAccounts.Main) {
        this.investmentAccounts = investmentAccounts;
    }

    async createProfile(profileId: string): Promise<boolean> {
        return this.investmentAccounts.api().createProfile(profileId);
    }
}