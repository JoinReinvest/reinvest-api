# ReInvest API

## Needed tools
1. Database tool for PostgreSQL (e.g. [DBeaver](https://dbeaver.io/))
2. Account in AWS
3. Docker compose
4. Postman

## How to run server?
1. Install dependencies `yarn install:all`
2. Create local .env file `cp .env.example .env.local`
3. Add `.pem` files to main folder
4. Connect with INFRA-ROOT AWS account by using `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
5. Run `yarn local:server`
6. Run `yarn local`
7. Run migrations `local:invoke:migrateUp`. `migrate:up` command will run all migrations. `local:invoke:migrateDown` will rollback one migration.

## Main rules:
1. API is divided on modules, each module (excepts ApiGateway and AdminApiGateway) has its own database and migrations. Modules are independent, they don't share tables between each other, they can communicate between them by API. Each module has to implement 3 folders: migrations, src and test.
2. Separate writing from reading. To return updated or added data first do mutation and then call query.
3. Based on the module, we are able to move on to other applications. Use `Clean architecture`, 3 layers: infrastructure, domain, application.

### Postman: 
1. Don't touch `REINVEST - clean scenarious` - it's for tester
2. `REINVEST - raw requests` is correct collection for developers

### How to create user?
1. Create and login user by calling `[TEST] Create and login user` request in `Set up tests/Create profile` folder in Postman collection. Each call will create new user with new `userIncrementalNumber` in Postman env.
2. Create profile by calling `Complete Profile details Copy` request in `Onboarding user fot tests/Create profile` folder in Postman collection
3. Create individual account by calling `Add Individual draft account` in `Onboarding user fot tests/Individual` folder in Postman collection
4. Fill individual account by calling `Fill individual draft` in `Onboarding user fot tests/Individual`
5. Open individual account by calling `Open individual account` in `Onboarding user fot tests/Individual`
6. Connect account with Plaid by calling `Create Plaid link` in `Onboarding user fot tests/Individual`
7. Complete Plaid data by calling `Fulfill bank account Copy 2` in `Onboarding user fot tests/Individual`

### Infrastructure
4 serverless:
- functions 
- global - contain `sesResources` - templates for emails
- local - contains all serverless: functions, global, sass
- saas - load common like VPC, Cognito, S3, Bastion resources

For each serverless we have one github action. We can deploy by `global:deploy` command or by githuba ction by `global:redeploy` command

### Environment variables
Environment variable types:
- common type - has own name
- shared type - has own name with prefix `TEST_`, but it is shared between environments
- production type - always has own name with prefix `PRODUCTION_`

### API structure
- Each function is one entry point to the system in `devops/functions`, one main entry point to the system is `tests`, it is removed on production
- `preSignUp` and `postSignUp` are cognito hooks
- Each class should have `getClassName` function, by this we are able to add module in dependency injection
- Each folder in `Reinvest` is one module, each module has its own api, boostrap registers every module and start all application
- Bastion - small ec2 server, we can use it to connect to database
- When communicating with another module, we always do it in one file (ACL)

### Database 
REMEMBER: when we do migrations, all migrations are read, it sorts them by name, our migration should called  `migration_<year month day hour minute second>_<any name>`. 
They must be sorted from the oldest to the youngest, also check if migrate up and down command works.

### Modules
Each module is independent, works as "microservice", each has own folder with migrations and tables.
Interface `Module`: 
- `api` - return api of the module
- `close` - define what should be done when application is closed
- `migration` - return migration which should be run
- `isHandleEvent` - check if module is responsible for event
- `technicalEventHandler` - get event from queue and handle it

1. Archiving: archiving beneficiary accounts
2. Documents: sign links like put and get
3. Identity: communication with cognito
4. Inbox: receive data from queue, 3 queues
5. InvestmentAccounts: it is done as aggregate, manage mainly profile, register accounts (should be merged to Legal Entity)
6. Investments: everything connected with investments
7. LegalEntities: data
8. Notifications: send emails, account activity
9. Portfolio: everything connected with dealpath, add portfolio info, communication with offerings, admin things
10. Registration: from LegalEntities module to manage data and send to NorthCapital and Veralo
11. Trading: execution of investments, make proper request to NorthCapital
12. SharesAndDividends: account stats, charts, calculation of dividends distribution
13. Verification: responsible for KYC, KYB, AML
14. Withdrawals: found and dividends withdrawals
15. AdminApiGateway and ApiGateway: responsible for graphql schema

### Useful phrases
- `SNS` - Simple Notification Service
- `ACL` - Anti Corruption Layer
- `VPC` - Virtual Private Cloud

### How to create portfolio locally?
Run this mutation with dummy data locally. Mutation contains keys to NC and Vertalo sandbox.
```
mutation {
  registerPortfolio(name: "Community REIT", northCapitalOfferingId:"1290029", vertaloAllocationId:"6a03167e-28d1-4378-b881-a5ade307b81b", linkToOfferingCircular:"https://reinvestcommunity.com") {
    id
    name
    vertaloAllocationId
    currentNav {
      dateSynchronization
      unitPrice {
        value
        formatted
      }
      numberOfShares
    }
    assetName
    offeringName
    linkToOfferingCircular
  }
}
```