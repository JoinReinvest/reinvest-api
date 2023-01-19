import {PostAuthenticationTriggerHandler} from 'aws-lambda';
import {boot} from "Reinvest/bootstrap";
import {InvestmentAccounts} from "Reinvest/InvestmentAccounts/src";
import {Identity} from "Reinvest/Identity/src";

export const main: PostAuthenticationTriggerHandler = async (event, context, callback) => {
    console.log({postSignupEvent: JSON.stringify(event)})
    const modules = boot();
    const investmentAccounts = modules.get(InvestmentAccounts.moduleName) as InvestmentAccounts.Main;
    const {sub: userId, email} = event.request.userAttributes;

    const profileId = await investmentAccounts.api().createProfile(userId, email);
};
