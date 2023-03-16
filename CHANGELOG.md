# REINVEST API CHANGELOG

## 1.0.2 - 03/16/2023

* added/implemented queries
    - [PARTIAL_MOCK] getIndividualAccount(accountId: String): IndividualAccount
    - [PARTIAL_MOCK] getAccountsOverview: [AccountOverview]
    - listAccountDrafts: [DraftAccount]
    - getIndividualAccount(accountId: String): IndividualAccount
    - listAccountTypesUserCanOpen: [AccountType]
    - [MOCK] phoneCompleted: Boolean
* implemented mutations:
    - removeDraftAccount(draftAccountId: ID): Boolean
    - openAccount(draftAccountId: String): Boolean
* Avatar `initials` added (currently hardcoded and only for IndividualAccount)
* SSN anonymization
* SSN validation
* updated description of queries and mutation + adding/removing [MOCK] annotation if return dummy data

## 1.0.1 - 03/13/2023

* AWS Simple Email Service basic integration
* Provide invitation links
    * Query: `userInvitationLink: UserInvitationLink`
* Complete individual draft account
    * Mutation: `completeIndividualDraftAccount(accountId: ID, input: IndividualAccountInput): IndividualDraftAccount`
    * Query: `getIndividualDraftAccount(accountId: ID): IndividualDraftAccount`
