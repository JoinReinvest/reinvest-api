// @ts-nocheck
import {
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
  AdminSetUserPasswordCommand,
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  ListUsersCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import * as bodyParser from 'body-parser';
import express from 'express';
import { PhoneNumber } from 'Identity/Domain/PhoneNumber';
import { RegistrationDatabase } from 'Registration/Adapter/Database/DatabaseAdapter';
import { boot } from 'Reinvest/bootstrap';
import { COGNITO_CONFIG, DATABASE_CONFIG, NORTH_CAPITAL_CONFIG, SQS_CONFIG, VERTALO_CONFIG } from 'Reinvest/config';
import { IdentityDatabase, userTable } from 'Reinvest/Identity/src/Adapter/Database/IdentityDatabaseAdapter';
import { InvestmentAccountsDatabase } from 'Reinvest/InvestmentAccounts/src/Infrastructure/Storage/DatabaseAdapter';
import { LegalEntitiesDatabase } from 'Reinvest/LegalEntities/src/Adapter/Database/DatabaseAdapter';
import { Registration } from 'Reinvest/Registration/src';
import { NorthCapitalAdapter } from 'Reinvest/Registration/src/Adapter/NorthCapital/NorthCapitalAdapter';
import { VertaloAdapter } from 'Reinvest/Registration/src/Adapter/Vertalo/VertaloAdapter';
import serverless from 'serverless-http';
import { DatabaseProvider, PostgreSQLConfig } from 'shared/hkek-postgresql/DatabaseProvider';
import { QueueSender } from 'shared/hkek-sqs/QueueSender';

import { main as postSignUp } from '../postSignUp/handler';
// dependencies
type AllDatabases = IdentityDatabase & LegalEntitiesDatabase & InvestmentAccountsDatabase & RegistrationDatabase;
const databaseProvider: DatabaseProvider<AllDatabases> = new DatabaseProvider<AllDatabases>(DATABASE_CONFIG as PostgreSQLConfig);

const queueSender = new QueueSender(SQS_CONFIG);

async function sendMessage(kind: string, id: string, data: any): Promise<void> {
  const message = { kind, id, data };
  await queueSender.send(JSON.stringify(message));
}

const app = express();
app.use(bodyParser.urlencoded({ extended: true }) as any);
const router = express.Router();

const decodeJwt = (token: string) => JSON.parse(atob(token.split('.')[1]));
const getProfileIdFromAccessToken = async token => {
  const { sub } = decodeJwt(token);
  const { profileId } = await databaseProvider
    .provide()
    .selectFrom(userTable)
    .select(['profileId'])
    .where('cognitoUserId', '=', sub)
    .limit(1)
    .executeTakeFirstOrThrow();

  return profileId;
};

const getUserIdFromAccessToken = async token => {
  const { sub } = decodeJwt(token);

  return sub;
};

router.post('/get-sms-topt', async (req: any, res: any) => {
  try {
    const { phoneNumber } = req.body;
    const phoneNumberVO = new PhoneNumber('+1', phoneNumber);
    const userId = await getUserIdFromAccessToken(req.headers.authorization);
    const data = await databaseProvider
      .provide()
      .selectFrom('identity_phone_verification')
      .select(['topt'])
      .where('phoneNumber', '=', phoneNumberVO.getPhoneNumber())
      .where('userId', '=', userId)
      .limit(1)
      .executeTakeFirstOrThrow();

    res.status(200).json({
      topt: data.topt,
      status: true,
    });
  } catch (e: any) {
    console.log(e.message);
    res.status(500).json({
      status: false,
    });
  }
});

router.post('/events', async (req: any, res: any) => {
  try {
    const { kind } = req.body;
    const id = await getProfileIdFromAccessToken(req.headers.authorization);
    switch (kind) {
      case 'LegalProfileCompleted':
        await sendMessage(kind, id, {});
        break;
      case 'IndividualAccountOpened':
        const { individualAccountId } = req.body;
        await sendMessage(kind, id, { individualAccountId });
        break;
      case 'CorporateAccountOpened':
        const { accountId: corporateAccountId } = req.body;
        await sendMessage(kind, id, { corporateAccountId: corporateAccountId });
        break;
      case 'TrustAccountOpened':
        const { accountId: trustAccountId } = req.body;
        await sendMessage(kind, id, { trustAccountId: trustAccountId });
        break;
      default:
        throw new Error('Unknown event');
    }

    res.status(200).json({
      status: true,
    });
  } catch (e: any) {
    console.log(e);
    res.status(500).json({
      status: false,
      message: e.message,
    });
  }
});

const userRouter = () => {
  const router = express.Router({ mergeParams: true });
  const password = 'ThisTestUserPassword123!';
  const getUserEmail = (userNumber: number) => `reinvest-test-user-${userNumber}@devkick.pl`;
  router.post('/my-profile-id', async (req: any, res: any) => {
    const profileId = await getProfileIdFromAccessToken(req.headers.authorization);
    res.status(200).json({
      profileId,
    });
  });
  router.post('/create-and-login', async (req: any, res: any) => {
    try {
      const { userNumber, referralCode } = req.body;
      const incentiveToken = referralCode ? referralCode : '';
      const client = new CognitoIdentityProviderClient({ region: COGNITO_CONFIG.region });

      const email = getUserEmail(userNumber);

      const userAttributes = [
        {
          Name: 'email',
          Value: email,
        },
        {
          Name: 'email_verified',
          Value: 'true',
        },
        {
          Name: 'custom:incentive_token',
          Value: incentiveToken,
        },
      ];

      const createUserCommand = new AdminCreateUserCommand({
        UserPoolId: COGNITO_CONFIG.userPoolID,
        Username: email,
        MessageAction: 'SUPPRESS',
        DesiredDeliveryMediums: ['EMAIL'],
        TemporaryPassword: 'thisIsATemporaryPassword123!ImustProvide',
        UserAttributes: userAttributes,
      });
      const createUserResult = await client.send(createUserCommand);

      let postSignUpResult = false;
      await postSignUp(
        {
          request: {
            userAttributes: {
              sub: createUserResult.User.Username,
              email_verified: true,
              email,
              'custom:incentive_token': incentiveToken,
            },
          },
        },
        {},
        message => {
          console.log(`postSignUp: ${message}`);
          postSignUpResult = message;
        },
      );

      const changePasswordCommand = new AdminSetUserPasswordCommand({
        Password: password,
        Permanent: true,
        Username: createUserResult.User.Username,
        UserPoolId: COGNITO_CONFIG.userPoolID,
      });
      const changePasswordResult = await client.send(changePasswordCommand);

      const SignInCommand = new InitiateAuthCommand({
        ClientId: COGNITO_CONFIG.localClientId,
        AuthFlow: 'USER_PASSWORD_AUTH',
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      });
      const signInResult = await client.send(SignInCommand);

      res.status(200).json({
        status: true,
        createUserResult,
        postSignUpResult,
        changePasswordResult,
        signInResult,
      });
    } catch (e: any) {
      console.log(e);
      res.status(500).json({
        status: false,
        message: e.message,
      });
    }
  });
  router.post('/login', async (req: any, res: any) => {
    try {
      const { userNumber } = req.body;

      const client = new CognitoIdentityProviderClient({ region: COGNITO_CONFIG.region });
      const email = getUserEmail(userNumber);

      const SignInCommand = new InitiateAuthCommand({
        ClientId: COGNITO_CONFIG.localClientId,
        AuthFlow: 'USER_PASSWORD_AUTH',
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      });
      const signInResult = await client.send(SignInCommand);

      res.status(200).json({
        status: true,
        signInResult,
      });
    } catch (e: any) {
      console.log(e);
      res.status(500).json({
        status: false,
        message: e.message,
      });
    }
  });

  router.post('/remove', async (req: any, res: any) => {
    try {
      const { userNumber } = req.body;

      const client = new CognitoIdentityProviderClient({ region: COGNITO_CONFIG.region });
      const email = getUserEmail(userNumber);

      const listUsersCommand = new ListUsersCommand({
        UserPoolId: COGNITO_CONFIG.userPoolID,
        AttributesToGet: ['sub'],
        Limit: 1,
        Filter: `email = "${email}"`,
      });

      const findUserResult = await client.send(listUsersCommand);
      const sub = findUserResult?.Users[0]?.Attributes[0]?.Value;

      if (!sub) {
        throw new Error('User not found');
      }

      let removeFromDatabaseStatus = true;
      try {
        const { profileId } = await databaseProvider
          .provide()
          .selectFrom('identity_user')
          .select(['profileId'])
          .where('cognitoUserId', '=', sub)
          .limit(1)
          .executeTakeFirstOrThrow();

        const recordIds = await databaseProvider
          .provide()
          .selectFrom('registration_mapping_registry')
          .select(['recordId'])
          .where('profileId', '=', profileId)
          .execute();

        if (recordIds.length > 0) {
          const removeByRecordId = [
            'registration_north_capital_synchronization',
            'registration_vertalo_synchronization',
            'registration_north_capital_documents_synchronization',
          ];

          for (const table of removeByRecordId) {
            for (const record of recordIds) {
              await databaseProvider.provide().deleteFrom(table).where('recordId', '=', record.recordId).execute();
            }
          }
        }

        const removeItemsByProfile = {
          legal_entities_draft_accounts: 'profileId',
          legal_entities_individual_account: 'profileId',
          legal_entities_company_account: 'profileId',
          legal_entities_profile: 'profileId',
          investment_accounts_profile_aggregate: 'aggregateId',
          registration_mapping_registry: 'profileId',
          identity_user: 'profileId',
        };

        for (const [table, column] of Object.entries(removeItemsByProfile)) {
          await databaseProvider.provide().deleteFrom(table).where(column, '=', profileId).execute();
        }
      } catch (e) {
        console.log('User not found in database');
        removeFromDatabaseStatus = false;
      }

      const removeUserCommand = new AdminDeleteUserCommand({
        UserPoolId: COGNITO_CONFIG.userPoolID,
        Username: sub,
      });
      const removeUserResult = await client.send(removeUserCommand);

      res.status(200).json({
        status: true,
        removeUserResult,
        findUserResult,
        removeFromDatabaseStatus,
        sub,
      });
    } catch (e: any) {
      console.log(e);
      res.status(500).json({
        status: false,
        message: e.message,
      });
    }
  });

  return router;
};
const syncRouter = () => {
  const router = express.Router({ mergeParams: true });
  router.post('/sync-dirties', async (req: any, res: any) => {
    try {
      const modules = boot();
      const registrationApi = modules.getApi<Registration.ApiType>(Registration);
      const ids = await registrationApi.listObjectsToSync();

      if (ids.length === 0) {
        res.status(404).json({
          status: false,
          message: 'No dirty objects to synchronize',
        });

        return;
      }

      const statuses = [];

      for (const id of ids) {
        const syncStatus = await registrationApi.synchronize(id);
        statuses.push({
          id: id,
          status: syncStatus,
        });
      }

      res.status(200).json({
        statuses,
      });
    } catch (e: any) {
      console.log(e);
      res.status(500).json({
        status: false,
        message: e.message,
      });
    }
  });

  return router;
};
const northCapitalRouter = () => {
  const router = express.Router({ mergeParams: true });
  router.post('/get-profile', async (req: any, res: any) => {
    try {
      const profileId = await getProfileIdFromAccessToken(req.headers.authorization);
      const mappedRecord = await databaseProvider
        .provide()
        .selectFrom('registration_mapping_registry')
        .select(['profileId', 'recordId', 'externalId', 'mappedType', 'email', 'status', 'version', 'createdDate', 'updatedDate'])
        .where('profileId', '=', profileId)
        .where('mappedType', '=', 'PROFILE')
        .limit(1)
        .executeTakeFirstOrThrow();

      const ncSyncRecord = await databaseProvider
        .provide()
        .selectFrom('registration_north_capital_synchronization')
        .select(['northCapitalId', 'recordId', 'type', 'crc', 'links', 'version', 'createdDate', 'updatedDate'])
        .where('recordId', '=', mappedRecord.recordId)
        .limit(1)
        .executeTakeFirstOrThrow();

      const ncAdapter = new NorthCapitalAdapter(NORTH_CAPITAL_CONFIG);
      const party = await ncAdapter.getParty(ncSyncRecord.northCapitalId);
      const partyDocuments = await ncAdapter.getUploadedDocuments(ncSyncRecord.northCapitalId);

      res.status(200).json({
        status: true,
        mappedRecord,
        ncSyncRecord,
        party,
        partyDocuments,
      });
    } catch (e: any) {
      console.log(e);
      res.status(500).json({
        status: false,
        message: e.message,
      });
    }
  });
  router.post('/get-account', async (req: any, res: any) => {
    try {
      const { accountId } = req.body;
      const profileId = await getProfileIdFromAccessToken(req.headers.authorization);
      const mappedRecord = await databaseProvider
        .provide()
        .selectFrom('registration_mapping_registry')
        .select(['profileId', 'recordId', 'externalId', 'mappedType', 'email', 'status', 'version', 'createdDate', 'updatedDate'])
        .where('profileId', '=', profileId)
        .where('externalId', '=', accountId)
        .limit(1)
        .executeTakeFirstOrThrow();

      const ncSyncRecord = await databaseProvider
        .provide()
        .selectFrom('registration_north_capital_synchronization')
        .select(['northCapitalId', 'recordId', 'type', 'crc', 'links', 'version', 'createdDate', 'updatedDate'])
        .where('recordId', '=', mappedRecord.recordId)
        .limit(1)
        .executeTakeFirstOrThrow();

      const ncAdapter = new NorthCapitalAdapter(NORTH_CAPITAL_CONFIG);
      const account = await ncAdapter.getAccount(ncSyncRecord.northCapitalId);
      const accountLinks = await ncAdapter.getAllRawAccountLinks(ncSyncRecord.northCapitalId);

      for (const link of accountLinks) {
        if (link.relatedEntryType === 'IndivACParty') {
          link['party'] = await ncAdapter.getParty(link.relatedEntry);
        } else if (link.relatedEntryType === 'EntityACParty') {
          link['party'] = await ncAdapter.getEntity(link.relatedEntry);
        }

        link['partyDocuments'] = await ncAdapter.getUploadedDocuments(link.relatedEntry);
      }

      res.status(200).json({
        status: true,
        mappedRecord,
        ncSyncRecord,
        account,
        accountLinks,
      });
    } catch (e: any) {
      console.log(e);
      res.status(500).json({
        status: false,
        message: e.message,
      });
    }
  });
  router.post('/sync-documents', async (req: any, res: any) => {
    try {
      const modules = boot();
      const registrationApi = modules.getApi<Registration.ApiType>(Registration);
      const documentIds = await registrationApi.listDocumentsToSynchronize();

      if (documentIds.length === 0) {
        res.status(404).json({
          status: false,
          message: 'No documents to synchronize',
        });

        return;
      }

      const statuses = [];

      for (const documentId of documentIds) {
        const syncStatus = await registrationApi.synchronizeDocument(documentId);
        statuses.push({
          documentId,
          status: syncStatus,
        });
      }

      res.status(200).json({
        statuses,
      });
    } catch (e: any) {
      console.log(e);
      res.status(500).json({
        status: false,
        message: e.message,
      });
    }
  });

  return router;
};
const vertaloRouter = () => {
  const router = express.Router({ mergeParams: true });
  router.post('/get-account', async (req: any, res: any) => {
    try {
      const { accountId } = req.body;

      const profileId = await getProfileIdFromAccessToken(req.headers.authorization);
      const mappedRecord = await databaseProvider
        .provide()
        .selectFrom('registration_mapping_registry')
        .select(['profileId', 'recordId', 'externalId', 'mappedType', 'email', 'status', 'version', 'createdDate', 'updatedDate'])
        .where('profileId', '=', profileId)
        .where('externalId', '=', accountId)
        .limit(1)
        .executeTakeFirstOrThrow();

      const vertaloSyncRecord = await databaseProvider
        .provide()
        .selectFrom('registration_vertalo_synchronization')
        .select(['vertaloIds', 'recordId', 'type', 'crc', 'documents', 'version', 'createdDate', 'updatedDate'])
        .where('recordId', '=', mappedRecord.recordId)
        .limit(1)
        .executeTakeFirstOrThrow();

      const vertaloAdapter = new VertaloAdapter(VERTALO_CONFIG);
      const { customerId } = vertaloSyncRecord.vertaloIds;
      const account = await vertaloAdapter.getAccount(customerId);

      res.status(200).json({
        status: true,
        mappedRecord,
        vertaloSyncRecord,
        account,
      });
    } catch (e: any) {
      console.log(e);
      res.status(500).json({
        status: false,
        message: e.message,
      });
    }
  });

  return router;
};

router.use('/user', userRouter());
router.use('/north-capital', northCapitalRouter());
router.use('/vertalo', vertaloRouter());
router.use('/sync', syncRouter());

app.use('/tests', router);
export const main = serverless(app);
