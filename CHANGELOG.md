# REINVEST API CHANGELOG

## 1.16.1 - 06/14/2023

* New MOCK query:
    * `getPortfolioDetails` - returns all information about properties in the portfolio
* [TESTS] endpoints:
    * `POST /north-capital/get-trade`
        * with body, investmentId: string
        * tt returns trade information from North Capital and from REINVEST db.
    * `POST /north-capital/update-trade-state`
        * with body, investmentId: string, tradeState: SETTLED | FUNDED
        * it updates trade status in North Capital
        * run `push-transaction` endpoint after that, to update investment status in REINVEST db
    * `POST /sync/push-transaction` with body, investmentId: string
        * it pushes transaction process further after changing status in North Capital
    * `POST /user/create-and-login` - it also adds user to the `Executives` group
    * `POST /north-capital/set-bank-account` - it allows to set bank account details in the replacement of doing the
      Plaid flow
    * `POST /calculate/next-dividends-batch` - it pushes dividends calculation after dividends declaration (as a
      replacement of cron)
    * `POST /calculate/distribute-dividends` - it pushes dividends distribution after dividends calculation (as a
      replacement of cron)
* No MOCKS anymore:
    * `updateIndividualAccount` query
    * `updateProfile` query
* `deactivateBankAccount` mock mutation was removed
* `listBeneficiaries` mock query was removed

## 1.16 - 06/13/2023

* **!BREAKING CHANGE! - everywhere "id" was represented by `string` type in the API, has changed to `ID` type!**
* New MOCKS:
    * Queries:
        * `getAccountActivity` - list account activities. The list of potential activities is listed in
          the `AccountActivity`
          enum
        * `listBeneficiaries`
        * `listInvestments` - List of all investments history
        * `listDividends` - List of all dividends history
    * Mutations:
        * `updateProfile`
        * `updateIndividualAccount`
        * `updateCorporateAccount`
        * `updateTrustAccount`
        * `updateBeneficiaryAccount`
        * `archiveBeneficiaryAccount`
        * `updateEmailAddress`
        * `cancelInvestment` - it cancels investment process, but only if the investment HAS BEEN started already and
          the Grace Period has not ended yet
        * `getFundsWithdrawalAgreement` - it returns funds withdrawal agreement in the same template format as for
          subscription agreement
        * `signFundsWithdrawalAgreement` - it signs funds withdrawal agreement
* API Changes:
    * `readBankAccount` query returns new field: `bankAccountStatus` - it returns the status of the bank account (
      active/inactive/draft)
    * `getInvestmentSummary` query returns also `BankAccount` type information
    * `positionTotal` field was removed
      from `AccountOverview`, `IndividualAccount`, `CorporateAccount`, `TrustAccount`
      types. Right now this field is present only in `AccountStats` type as `accountValue`
        * Queries/Mutations:  `getTemplate`, `signDocumentFromTemplate` were removed from the API
    * Updating type names:
        * `SubscriptionAgreementStatus` -> `AgreementStatus`
        * `SubscriptionAgreementParagraph` -> `AgreementParagraph`
        * `SubscriptionAgreementSection` -> `AgreementSection`
    * Updating MOCKS for `FundsWithdrawalAgreement`
        * After consulting with Transfer Agent, the API will return the same template as for subscription agreement for
          funds withdrawal agreement
        * the investor does not have to download/print/sign/upload anything.
        * **The process of signing funds withdrawal agreement is the same as for subscription agreement**
        * See changes in the API for
          mutations: `createFundsWithdrawalAgreement`, `signFundsWithdrawalAgreement`, `requestFundsWithdrawal`
* No MOCKS anymore:
    * `abortInvestment` - it aborts investment process, but only if the investment HAS NOT BEEN started yet
    * `deactivateRecurringInvestment` - it deactivates (soft delete) recurring investment
    * `unsuspendRecurringInvestment`  - it activates recurring investment if went to SUSPENDED state (because of failed
      transactions)

* Backend changes:
    * Added dividends implementation
        * [ADMIN] Added dividend declaration process
        * [CRON] Dividends calculation
        * [ADMIN] Added dividend distribution process
        * [CRON]  Distribute dividends to investors and send notifications
    * After signing subscription agreement, the PDF file is actually generated and stored in S3

## 1.15  05/26/2023 - 06/19/2023

* No MOCKS anymore:
    * For account settings
        * `getAccountConfiguration`
        * `setAutomaticDividendReinvestmentAgreement`
    * For investment process
        * `signSubscriptionAgreement`
        * `startInvestment`
    * For recurring investment process
        * `getScheduleSimulation`
        * `createRecurringInvestment`
        * `createRecurringSubscriptionAgreement`
        * `signRecurringInvestmentSubscriptionAgreement`
        * `initiateRecurringInvestment`
        * `getActiveRecurringInvestment`
        * `getDraftRecurringInvestment`
    * For account stats
        * `getAccountStats`
        * `getEVSChart`
        * `getNotifications`
        * `markNotificationAsRead`
    * For dividends
        * `reinvestDividend`

* New Queries:
    * `getNotificationStats` - provides info about the number of unread/total notifications for the given account id
        * it allows to retrieve notifications directly in the same query

* ADMIN:
    * new mutation for Executives: `giveIncentiveRewardByHand` that allow to give the user incentive reward by hand

* Changes:
    * Notifications with `isDismissible` = `false` are not dismissible anymore. They are always first in the list.
        * notification is dismissed automatically after some time or after some action
    * Dividends reinvestment actually triggers shares transfer from REINVEST to investor in Vertalo (sandbox)
    * Investing for beneficiaries works the same as for regular account

## 1.14 - 05/24/2023

* add `bankName` filed in `readBankAccount` query
* update query `getNotDismissedNotifications` name to `getNotifications`
    * add filter UNREAD/ALL instead
* add [MOCK] query: getNotificationsStats that returns the number of unread/total notifications for the given account id
* Queries/Mutations that are no longer MOCKS:
    * `getSubscriptionAgreement`
    * `createInvestment`
    * `createSubscriptionAgreement`
    * `getInvestmentSummary`

## 1.13.1 - 05/23/2023

* Implementing investment process manager
* Investment process manager includes steps:
    * VerifyAccountForInvestment: Verify account for investment (KYC, AML). Confirm if all were verified
    * FinalizeInvestment: [MOCK] Generate subscription agreement, confirm fees
    * CreateTrade:
        * Create trade in North Capital
        * Create drafted distribution in Vertalo
        * Upload subscription agreement to North Capital trade
        * Initiate funds transfer from external bank account to REINVEST escrow account
        * Open Vertalo distribution (waiting for funds transfer)
    * CheckIsInvestmentFunded:
        * Check if funds transfer is completed in North Capital
        * Close Vertalo distribution (funds transfer completed)
    * CheckIsInvestmentApproved: [MOCK] Check trade RR Approval status by Dalmore
    * CheckIsGracePeriodEnded: Check if grace period is ended
    * MarkFundsAsReadyToDisburse: Mark funds as ready to disburse
    * TransferSharesWhenTradeSettled:
        * Verify if trade is settled
        * Mark payment as completed in Vertalo
        * Transfer shares from REINVEST to investor in Vertalo
    * FinishInvestment: [MOCK] Finish investment
    * [FOR TESTS PURPOSE] Next states of process are triggered by changes the state of trade in North Capital
        * trade CREATED -> FUNDED -> SETTLED

## 1.13 - 05/17/2023

* Type `Money` from now on accepts only integer values instead of strings.
* All mutations that accept `Money` type/input will accept only integer values instead of strings.
* The integer should contain the value in the smallest currency unit (e.g. cents for USD).
    * For example: `100` instead of `1.00`
    * `1=$0.01`, `1000` = `$10.00`, `10000000` = `$100,000.00`

## 1.12.5 - 05/17/2023

* `RecurringInvestmentStatus` changes
  to `DRAFT`, `WAITING_FOR_SIGNING_SUBSCRIPTION_AGREEMENT`, `ACTIVE`, `SUSPENDED`, `INACTIVE`

## 1.12.4 - 05/16/2023

* Subscription agreement changes:
    * remove `bold` field. Instead of that parse `{{text to be bolder}}` for lines and headers
    * `signSubscriptionAgreement` mutation expects `investmentId` instead of `subscriptionAgreementId`
* New MOCK query:
    * `getDividend` - It returns the dividend details for the specific dividend id
* Notification changes:
    * Text to be bold is wrapped in `{{text to be bolder}}`
* Mutation that are not mocks anymore:
    * `updateProfileForVerification` - It updates profile for verification. Provide only fields that were changed by the
      investor, but all required to meet the schema definition.
      For example if investor changed only 'firstName' then provide only field 'name'.
      The name field expects PersonName type, so it must contain all required data (so 'firstName' and 'lastName' must
      be provided, even that only firstName changed).
    * `updateCompanyForVerification` - It updates stakeholder for verification. Provide only fields that were changed by
      the investor, but all required to meet the schema definition.
    * `updateStakeholderForVerification` - It updates company for verification. Provide only fields that were changed by
      the investor, but all required to meet the schema definition.

## 1.12.3 - 05/12/2023

* Notification mocks:
    * Flow:
        * Get all notifications for the given account id
        * Mark notification as read
        * Some of the notification are not dismissible (pinned) and cannot be marked as read. They are always first.
        * Not dismissible notifications will be marked as read by backend automatically after some time or after some
          action.
        * Based on notification type, some actions can be required (e.g. reinvest/withdraw dividend, unsuspend recurring
          investment, etc)
    * Mock Queries:
        * `getNotDismissedNotifications` - Get all notifications for the given account id
          It sorts notifications by date descending. Not dismissible (pinned) notifications are always first.
    * Mock Mutations:
        * `markNotificationAsRead` - Mark notification as read
* Dividends reinvestment/withdrawal mocks
    * Flow:
        * Take the dividend id from notification (in the future it will be possible to get it from the dividend list in
          the account settings)
        * Reinvest/withdraw dividend
    * Mock Mutations:
        * `reinvestDividend` - Reinvest dividend - you can reinvest many dividends in the same time. If one of them is
          not reinvestable, then all of them will be rejected.
        * `withdrawDividend` - Withdraw dividend - you can withdraw many dividends in the same time. If one of them is
          not withdrawable, then all of them will be rejected.
* Funds withdrawal mocks:
    * Flow:
        * Simulate the funds withdrawal with `simulateFundsWithdrawal` query. It returns the simulation of withdrawal
          without any changes in the system. If there are grace period investments then the funds withdrawal request
          will be rejected.
          Investor must cancel grace period investments manually first, before requesting the funds withdrawal.
        * Create funds withdrawal request with `createFundsWithdrawalRequest` mutation. It locks account, so an investor
          will not be able to invest as long as the funds withdrawal request is pending.
        * Create funds withdrawal agreement with `createFundsWithdrawalAgreement` mutation. It prepares the agreement
          for funds withdrawal file. The investor must download it, print it, sign it and upload it again.
        * Request the funds withdrawal with `requestFundsWithdrawal` mutation. The investor must sign the agreement
          first and provide the id of the signed agreement.
        * If an investor decides to abort the funds withdrawal request, then he can do it with
          `abortFundsWithdrawalRequest` mutation, but only if the funds withdrawal request is not yet approved or
          rejected already.
    * Mock Queries:
        * `simulateFundsWithdrawal` - Simulate funds withdrawal. It returns the simulation of withdrawal without any
          changes in the system.
        * `getFundsWithdrawalRequest` - Get funds withdrawal request. It returns the current status of funds withdrawal
          request.
    * Mock Mutations:
        * `createFundsWithdrawalRequest` - Create funds withdrawal request. It is just a DRAFT. You need to sign the
          agreement and then request the withdrawal.
        * `createFundsWithdrawalAgreement` - It prepares the agreement for funds withdrawal file.
          The investor must download it, print it, sign it and upload it again.
        * `requestFundsWithdrawal` - It requests the fund's withdrawal. The investor must sign the agreement first. To
          do
          that, use createFundsWithdrawalAgreement mutation and ask user to download, print, sign, scan and upload the
          agreement again.
        * `abortFundsWithdrawalRequest` - It aborts the funds withdrawal request if it is not yet approved or rejected
* Extra investment mutation mock for `abortInvestment` mutation
    * It aborts the investment that haven't been started yet (by startInvestment mutation).

## 1.12.3 - 05/11/2023

* Mock for account stats `getAccountStats` query

## 1.12.2 - 05/10/2023

* Mock for EVS chart
* New MOCK query:
    * `getEVSChart` - It returns the EVS chart data for the specific resolution
    * it returns up to 1000 data points for hard-coded period (2020-01-01 - 2022-09-26)
    * it works for all resolutions (1D, 1W, 1M, 1Y, 5Y, MAX)

## 1.12.1 - 05/10/2023

* Mock mutations and queries related to the recurring investment flow.
* Recurring investment flow steps:
    * Create recurring investment (`createRecurringInvestment`, `getScheduleSimulation`)
    * Sign recurring subscription
      agreement (`createRecurringSubscriptionAgreement`, `signRecurringInvestmentSubscriptionAgreement`)
    * Opt-in dividend reinvestment (if required) + verification
    * Show the recurring investment summary(`getDraftRecurringInvestment`)
    * Initialize the recurring investment (`initiateRecurringInvestment`)
* New queries (all are MOCKS!):
    * `getActiveRecurringInvestment` - It returns the current recurring investment summary.
    * `getDraftRecurringInvestment` - It returns the created draft recurring investment summary.
    * `getScheduleSimulation` - Returns the simulation of the recurring investment schedule.
* New mutations (all are MOCKS!):
    * `createRecurringInvestment` - It creates new investment and returns its ID.
      It requires bank account to be linked to the account.
      In other case it throws an error.
    * `createRecurringSubscriptionAgreement` - It creates new subscription agreement for the specific recurring
      investment
      It returns the content of the agreement that must be rendered on the client side.
      Client must sign the agreement and call signRecurringInvestmentSubscriptionAgreement mutation.
    * `signRecurringInvestmentSubscriptionAgreement` - It signs the recurring investment subscription agreement.
    * `initiateRecurringInvestment` - It STARTS the recurring investment, CANCEL previous recurring investment if exists
      and schedule the first investment.

## 1.12.0 - 05/09/2023

* Mock mutations and queries related to the investment flow.
* Investment flow steps:
    * Integrate bank account with
      Plaid (`readBankAccount`, `createBankAccount`, `updateBankAccount`, `fulfillBankAccount`)
    * Create investment (`createInvestment`)
    * Sign subscription agreement (`createSubscriptionAgreement`, `signSubscriptionAgreement`)
    * Opt-in automatic dividend reinvestment
      agreement (`getAccountConfiguration`, `setAutomaticDividendReinvestmentAgreement`)
    * Account KYC/AML verification (`verifyAccount`, `updateProfileForVerification`, `updateStakeholderForVerification`,
      `updateCompanyForVerification`)
    * Show the investment summary + fees (`getInvestmentSummary`, `approveFees`)
    * Start the investment (`startInvestment`)
* New queries (all are MOCKS!):
    * `getInvestmentSummary` - It returns the investment summary.
      Use this method to get info about the investment fees.
    * `getSubscriptionAgreement` - It returns the subscription agreement.
    * `getAccountConfiguration` - Return account configuration
* New mutations (all are MOCKS!):
    * `setAutomaticDividendReinvestmentAgreement` - Set automatic dividend reinvestment agreement
    * `createInvestment` -It creates new investment and returns its ID.
      It requires bank account to be linked to the account.
      In other case it throws an error.
    * `createSubscriptionAgreement` - It creates new subscription agreement for the specific investment
      It returns the content of the agreement that must be rendered on the client side.
      Client must sign the agreement and call signSubscriptionAgreement mutation.
    * `signSubscriptionAgreement` - It signs the subscription agreement.
    * `approveFees` - Approves the fees for the specific investment.
      In case if extra totalFeeAmount is required for recurring investment and the investment was started automatically
      by the
      system, then
      use this method to approve the fees (it will ask for that on verification step triggered from the notification).
    * `startInvestment` - It starts the investment.
      It requires subscription agreement to be signed and fees to be approved.
      The fees can be approved also by this method (if approveFees is true).

## 1.11.4 - 05/08/2023

* Changes:
    * Providing Plaid link integration for bank account
        * **Generating Plaid link costs $1.80 every time (on prod). Do not call it if it is not necessary.**
    * User must go to the Plaid in iframe/webview to fulfill the bank account details
    * After user choose the bank account, the Plaid will return the response to the REINVEST, which must be provided to
      the `fulfillBankAccount` mutation
        * The bank account will not be activated until the investor fulfills the bank account.
* New mutations:
    * `createBankAccount(accountId)` - It creates new link to the investor bank account. It works only if the account
      does not have any bank account linked yet.
    * `updateBankAccount(accountId)` - It updates the link to the investor bank account. It works only if the account
      has bank account linked already.
    * `fulfillBankAccount(accountId, input)` - Provide the response from Plaid here.
      The bank account will not be activated until the investor fulfills the bank account.
* New query:
    * `readBankAccount(accountId)` - Returns basic bank account information

## 1.11.3 - 05/05/2023

* New mutation:
    * `openBeneficiaryAccount` - it creates and immediately open beneficiary account (no draft required)
* New query:
    * `getBeneficiaryAccount(accountId)` - it returns beneficiary account details
* Updates:
    * query `getAccountsOverview` - returns also beneficiary account overview

## 1.11.2 - 04/26/2023

* `DocumentFileLinkInput` mutation accepts case insensitive `fileName` extension
* New unauthorized endpoint for webhooks:
    * `POST /webhooks/updateParty` - it handles events from North Capital regarding updating KYC and AML status

## 1.11.1 - 04/26/2023

* New Query: `getDocument(documentId)`
    * it returns link to read the document. The link expires after 60 minutes, but this value can change in the future!
    * if document is not found, the provided link will return 404 (it does not check if document actually exists in s3!)
    * use that query at the moment when user actually want to download/display the file, because of expiration time.

## 1.11.0 - 04/25/2023

* New mutation: `verifyAccount(accountId)`, which verifies all account parties (profile, stakeholders and company
  entity) against KYC/KYB/AML verfications
    * It returns `VerificationDecisions`:
        * `isAccountVerified: Boolean`: it tells if all account's parties are verified or not
        * `canUserContinueTheInvestment: Boolean`: it tells can user continue the investment or not. If not then user
          must do extra actions to continue the investment
        * `requiredActions`: list of actions that user must perform to continue the investement.
            * [IMPORTANT] Some actions ban profile or accounts
            * Action structure:
                * action: type of action. Based on that application must do some specific action
                * onObject: specifies the object that is a subject of an actions. It contains 2 fields:
                    * type: type of object. It can be one of: `PROFILE`, `STAKEHOLDER`, `COMPANY`
                    * optional accountId (apply to `STAKEHOLDER` and `COMPANY`)
                    * optional stakeholderId (apply to `STAKEHOLDER`)
                * reasons: list of errors, suggestions what went wrong during verification. Potentially it can be used
                  to display to user what went wrong
            * List of current actions:
                * `UPDATE_MEMBER` or `UPDATE_MEMBER_AGAIN`: it means that user must update details of object specified
                  in `onObject` field (use mutation `updateProfileForVerification`, `updateStakeholderForVerification`
                  or `updateCompanyForVerification` depending on the object type)
                * `BAN_ACCOUNT`: it means that account must be banned and investment process and all other investments
                  are blocked
                * `BAN_PROFILE`: it means that profile must be banned and all accounts are blocked
                * `REQUIRE_MANUAL_REVIEW` or `REQUIRE_ADMIN_SUPPORT`: just information, no action on frontend is
                  required (`canUserContinueTheInvestment` should be set to `true`)
* Added Admin API and Admin Explorer mode:
    * to login as admin, add your Cognito user to `Administrators` or `Executives` group
    * Admin API is available at `/api/admin`
    * Admin Explorer is available at `/explorer/admin`
    * Switcher between Admin/User explorer mode was added to the explorer in top right corner
    * Currently supported mutations:
        * `recoverVerification(objectId)`: it recovers verification after failure for object specified by `objectId`. It
          can be `accountId`, `stakeholderId` or `profileId`
* New [TEST] endpoints added:
    * `POST /north-capital/set-user-for-verification`: it sets user for verification in North Capital. It accepts
      parameters:
        * `partyId` - North Capital id of the party to be updated
        * `verificationType` - predefined user structure for verification in North Capital Sandbox, based on North
          Capital test data:
            * different scenarios for KYC in file: TransactCloud_KYCAMLDummyInfo_JohnSmith_APIResultCodes
                * https://app.hubspot.com/documents/4042879/view/434536244?accessId=90e4b9
            * AML fail in file: TransactCloud_AML_SDN_OFAC
                * https://app.hubspot.com/documents/4042879/view/471825264?accessId=b5b5e4
            * always pass KYC/AML - first name/last name must be equal to: `John Smith`
                * https://support.northcapital.com/knowledge/is-there-test-information-for-the-kyc/aml-checks
            * list of pre-implemented user structures:
                * `ALL_APPROVED` - approves all verifications
                * `ADDRESS_NOT_MATCH` - address does not match, but approves all verifications
                * `SSN_DOES_NOT_MATCH` - SSN does not match, require user update
                * `AML_FAIL` - AML fail, ban profile or account (depending on object type)
    * `POST /north-capital/clear-verification`: it clears verification for user on REINVEST side. It accepts
      parameters:
        * `partyIds` - North Capital ids of the party to be updated (it allows to clear verification for multiple
          parties at once)

## 1.10.1 - 04/20/2023

* Update stakeholder in draft by id:
    * if `id` field for stakeholder is provided, then stakeholder with the id will be updated - `UPDATE MODE`
    * if not `id` field for stakeholder is provided, then new stakeholder will be created - `CREATE MODE`
    * in `UPDATE MODE`:
        * ssn is optional
        * if ssn is provided, then it must be unique for all stakeholders in the draft
        * if ssn is provided, then it will be updated
        * rest of all fields are required
    * in `CREATE MODE`:
        * ssn is required
        * ssn must be unique for all stakeholders in the draft
        * if ssn is not unique, then existing stakeholder with this ssn will be overwritten

## 1.10.0 - 04/18/2023

* Updated Stakeholder domicile
    * New type `SimplifiedDomicile` that accept only values `RESIDENT` and `CITIZEN`

## 1.9.1 - 04/17/2023

* Removing documents from s3 bucket for documents and avatar
    * API removes files from s3 automatically if they are not used anymore
    * If you stopped using specific documentId, you can't re-use it again
    * Auto-removal files happens when:
        * avatar id changes (for individual/corporate/trust accounts) - the previous file is deleted
        * one or more document ids for idScans changes (for profile/stakeholder) - the previous files are deleted
        * explicitly run `removeCompanyDocuments`' for `completeCorporateDraftAccount`/`completeTrustDraftAccount`
          mutation
        * explicitly run `removeStakeholder`' for `completeCorporateDraftAccount`/`completeTrustDraftAccount` mutation
        * remove draft

## 1.9.0 - 04/14/2023

* [BREAKING CHANGE] Add new types of statements:
    * Privacy Policy Statement
    * Terms and Conditions Statement
* Privacy Policy Statement and Terms and Conditions Statement are required to be accepted by the user
    * If the user has not accepted the Privacy Policy Statement and Terms and Conditions Statement, then the profile
      will not be completed
* Allow to open Trust Account with empty EIN if Trust type is "Irrevocable Trust"

## 1.8.4 - 04/13/2023

* Cognito uses SES to send emails
* Bump dependencies versions
    * all libraries to the latest version
    * typescript to version 5
    * NodeJS from version 16 to 18

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
