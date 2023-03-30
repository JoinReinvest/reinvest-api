# REINVEST API CHANGELOG

## 1.7.0 - 03/30/2023

* Change FileLink types and inputs for GraphQL
    * separate `DocumentFileLinkInput` and `AvatarFileLinkInput`
    * `DocumentFileLinkInput` requires `fileName` field
    * `DocumentFileLinkId` and `GetDocumentLink` returns `fileName` field
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
