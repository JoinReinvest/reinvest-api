# REINVEST API CHANGELOG

## 1.8.3 - 04/11/2023

* Error handling with sentry integrated

## 1.8.2 - 04/11/2023

* Synchronization corporate/trust companies with Vertalo

## 1.8.1 - 04/11/2023

* Synchronization corporate/trust entities with North Capital:
    * Company entity: LLC/Partnership/Corporation/Revocable Trust/Irrevocable Trust
    * Company account: Corporate/Trust
    * Company stakeholder: Corporate/Trust
    * Documents upload for company entity and stakeholders
    * Linking company/stakeholders with an account

## 1.8.0 - 04/06/2023

* Employer field is optional if Employment Status is not "Employed" for `completeIndividualDraftAccount` mutation
* New queries:
    * `getCorporateAccount`
    * `getTrustAccount`
* Updated queries:
    * `getCorporateDraftAccount` and `getTrustDraftAccount` are no longer MOCKED
        * it returns new field "label"
        * it returns avatar with working "initials" field
    * `getAccountsOverview`:
        * it returns Individual, Corporate and Trust accounts
        * it returns new field "label"
        * it returns avatar with working "initials" field
    * `getIndividualAccount`:
        * it returns avatar with working "initials" field
        * it returns new field "label"
    * for `getCorporateDraftAccount`, `getTrustDraftAccount` and `getIndividualDraftAccount`:
        * `isCompleted` field is calculated dynamically on every call
        * `verifyAndFinish` field is removed from draft accounts mutations
* Updated mutations:
    * `completeCorporateDraftAccount` and `completeTrustDraftAccount` are no longer MOCKED
        * it returns new field "label"
        * it returns avatar with working "initials" field
* EIN uniqueness is verified against opened accounts, so it is possible to create draft account with the same EIN, but
  not to open both of them

## 1.7.3 - 03/31/2023

* query `phoneCompleted` is no longer mocked and returns real phone number completion status

## 1.7.2 - 03/31/2023

* Add optional `isSmsAllowed` field for `setPhoneNumber` mutation
    * If `isSmsAllowed` is set to `false` then SMS TOPT will not be sent
    * On default `isSmsAllowed` is set to `true`

## 1.7.1 - 03/30/2023

* Make consistent error response for mutation
    * `completeProfileDetails`
    * `completeIndividualDraftAccount`
* Details of errors are provided in the `errors.extensions.details` field
    * single error contains 3 fields:
        * `field` - step name
        * `type` - one of: UNKNOWN_ERROR, EMPTY_VALUE, FAILED, INVALID_DATE_FORMAT,
          INVALID_ID_FORMAT, INVALID_FORMAT, INVALID_TYPE, MISSING_MANDATORY_FIELDS, ALREADY_COMPLETED, NOT_UNIQUE,
          NOT_ACTIVE, NOT_INDIVIDUAL
        * `details` - additional details about the error
* fixes:
    * properly formatted phone number in `setPhoneNumber`/`verifyPhoneNumber` mutations

## 1.7.0 - 03/30/2023

* Change FileLink types and inputs for GraphQL
    * separate `DocumentFileLinkInput` and `AvatarFileLinkInput`
    * `DocumentFileLinkInput` requires `fileName` field
    * `DocumentFileLinkId` and `GetDocumentLink` returns `fileName` field
    * limit fileName only to `jpeg`, `jpg`, `png` and `pdf` extensions
* Synchronization profile documents with North Capital
    * Add `cronDocumentSync` lambda function triggered every 1 hour that synchronize up to 20 documents
* [TEST] endpoints:
    * `POST /tests/north-capital/get-profile` - returns also `partyDocuments` fields
    * `POST /tests/north-capital/sync-documents` - immediately synchronize up to 20 documents with North Capital

## 1.6.0 - 03/28/2023

* Updated `completeProfileDetails` mutation schema for dateOfBirth field (string to object)
* Test users endpoints. These endpoints are only available in `test` environment.
    * [TEST] endpoint: `POST /tests/user/create-and-login` - create user and login
    * [TEST] endpoint: `POST /tests/user/login` - login user
    * [TEST] endpoint: `POST /tests/user/remove` - remove user
    * all user endpoints require only incremental number as a parameter
* Test synchronization endpoints:
    * [TEST] endpoint: `POST /tests/north-capital/get-profile` - get North Capital profile
    * [TEST] endpoint: `POST /tests/north-capital/get-account` - get North Capital account
    * [TEST] endpoint: `POST /tests/vertalo/get-account` - get Vertalo account
* North Capital and Vertalo use REINVEST "fake" emails.
    * Email identifies REINVEST user in North Capital and Vertalo.
    * It includes <type>_<profileId>_<externalId>@<tld> where:
        * <type> - type of the account (profile/stakeholder or individual/corporate/trust/beneficiary account)
        * <profileId> - REINVEST profile id
        * <externalId> - REINVEST profile/stakeholder/account id
        * <tld> - REINVEST tld domain.

## 1.5.0 - 03/24/2023

* Vertalo Individual Account synchronization

## 1.4.0 - 03/23/2023

* Handling `IndividualAccountOpened` event
* North Capital Individual Account synchronization
* Linking North Capital Account and the Main Party
* Extending Main Party with extra investment information (net worth, income, employer, etc.)
* [TEST] Tests endpoints:
    - trigger `IndividualAccountOpened` event by `POST /tests/events`

## 1.3.0 - 03/22/2023

* Handling `LegalProfileCompleted` event
* North Capital Main Party synchronization
    - synchronization locking
    - calculating checksum of changes
    - North Capital Main party create
    - North Capital Main party update
* [TEST] Tests endpoints:
    - trigger `LegalProfileCompleted` event by `POST /tests/events`
    - return SMS TOPT token by `POST /tests/get-sms-topt`

## 1.2.0 - 03/16/2023

* added/implemented queries
    - [PARTIAL_MOCK] getIndividualAccount(accountId: String): NorthCapitalIndividualAccount
    - [PARTIAL_MOCK] getAccountsOverview: [AccountOverview]
    - listAccountDrafts: [DraftAccount]
    - getIndividualAccount(accountId: String): NorthCapitalIndividualAccount
    - listAccountTypesUserCanOpen: [AccountType]
    - [MOCK] phoneCompleted: Boolean
* implemented mutations:
    - removeDraftAccount(draftAccountId: ID): Boolean
    - openAccount(draftAccountId: String): Boolean
* Avatar `initials` added (currently hardcoded and only for NorthCapitalIndividualAccount)
* SSN anonymization
* SSN validation
* updated description of queries and mutation + adding/removing [MOCK] annotation if return dummy data

## 1.1.0 - 03/13/2023

* AWS Simple Email Service basic integration
* Added verification of referral code by unauthorized `POST /incentive-token` endpoint
* Added proper verification of a referral code on sign up
* Provide invitation links
    * Query: `userInvitationLink: UserInvitationLink`
* Complete individual draft account
    * Mutation: `completeIndividualDraftAccount(accountId: ID, input: IndividualAccountInput): IndividualDraftAccount`
    * Query: `getIndividualDraftAccount(accountId: ID): IndividualDraftAccount`
