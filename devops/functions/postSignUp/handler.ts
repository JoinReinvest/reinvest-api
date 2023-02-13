import {PostAuthenticationTriggerHandler} from 'aws-lambda';
import {boot} from "Reinvest/bootstrap";
import {Identity} from "Identity/index";

export const main: PostAuthenticationTriggerHandler = async (event, context, callback) => {
    const {request: {userAttributes}} = event;
    if (!userAttributes) {
        callback('MISSING_USER_ATTRIBUTES', event);
        return;
    }

    const {sub, email_verified: emailVerified, email, "custom:incentive_token": token} = userAttributes;
    if (!sub) {
        callback('MISSING_USER_ID', event);
        return;
    }

    if (!emailVerified) {
        callback('EMAIL_NOT_VERIFIED', event);
        return;
    }

    const userId = sub;
    const incentiveToken = !token || token.length === 0 ? null : token;

    const modules = boot();
    const identity = modules.getApi<Identity.ApiType>(Identity);
    await identity.registerUser(userId, email, incentiveToken);

    callback(null, event);
};
