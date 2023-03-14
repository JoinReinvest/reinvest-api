import {PostAuthenticationTriggerHandler} from 'aws-lambda';
import {boot} from "Reinvest/bootstrap";
import {IdentityApiType} from "Reinvest/Identity/src/Port/Api/IdentityApi";
import {Identity} from "Reinvest/Identity/src";

export const main: PostAuthenticationTriggerHandler = async (event, context, callback) => {
    const {request: {userAttributes}} = event;
    if (!userAttributes) {
        callback('MISSING_USER_ATTRIBUTES', event);
        return;
    }

    const {"custom:incentive_token": token} = userAttributes;
    if (token && token !== "") {
        const modules = boot();
        const identityModule = modules.getApi<IdentityApiType>(Identity);
        const status = await identityModule.isIncentiveTokenValid(token);
        await modules.close();
        if (!status) {
            callback('WRONG_REFERRAL_CODE', event);
            return;
        }
    }

    callback(null, event);
};
