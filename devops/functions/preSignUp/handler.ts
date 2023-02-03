import {PostAuthenticationTriggerHandler} from 'aws-lambda';

export const main: PostAuthenticationTriggerHandler = async (event, context, callback) => {
    const {request: {userAttributes}} = event;
    console.log({userAttributes});
    if (!userAttributes) {
        callback('MISSING_USER_ATTRIBUTES', event);
        return;
    }

    const {"custom:incentive_token": token} = userAttributes;
    if (token && token !== "") {
        if (token !== "123456") { // mock
            callback('WRONG_REFERRAL_CODE', event);
            return;
        }
    }

    callback(null, event);
};
