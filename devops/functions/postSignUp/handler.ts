import { PostAuthenticationTriggerHandler } from 'aws-lambda';
import { Identity } from 'Identity/index';
import { logger } from 'Logger/logger';
import { boot } from 'Reinvest/bootstrap';
import { SENTRY_CONFIG } from 'Reinvest/config';

console = logger(SENTRY_CONFIG);

export const main: PostAuthenticationTriggerHandler = async (event, context, callback) => {
  console.log('[PostSignUp] Profile registration started', event);
  const {
    request: { userAttributes },
  } = event;

  if (!userAttributes) {
    callback('MISSING_USER_ATTRIBUTES', event);

    return;
  }

  const { sub, email_verified: emailVerified, email, 'custom:incentive_token': token } = userAttributes;

  if (!sub) {
    callback('MISSING_USER_ID', event);

    return;
  }

  if (!emailVerified || !email) {
    callback('EMAIL_NOT_VERIFIED', event);

    return;
  }

  console.log(`[PostSignUp] Register user ${sub} with referral code "${token}"`);
  const userId = sub;
  const incentiveToken = !token || token.length === 0 ? null : token;

  const modules = boot();
  const identity = modules.getApi<Identity.ApiType>(Identity);
  await identity.registerUser(userId, email, incentiveToken);
  await modules.close();

  console.log('Post Authentication profile registration finished');
  callback(null, event);

  return;
};
