# Global Architecture Decision Record

## Deployment Architecture decision

### Decision from 12th of October 2022

* Author: Lukasz Duraj
* Drivers:
    * This is the first iteration of the application, and we are in the MVP phase
    * We are in the learning phase of the business processes
    * Long-lived application
* Decision: Modular Monolith
* Explanations:
  Currently we are in the MVP phase, and we are still learning the business processes.
  We don't have any drivers that could lead us into microservices application.
* Consequences:
    * We need to good understand the business to modularize the system in good-enough way (using Bounded Contexts)
    * We need to specify the integration context map between modules (downstream/upstream)
    * Increasing the complexity on the modules integration
* Other options:
    * Monolith - declined, because it is considered as an anti-pattern and the app probably will be maintained for
      years (
      long-term investments)
    * Microservices - declined, there is very small team of developers and there are no scalability requirements yet

## Bounded context integration decision

// TODO Context map + downstream/upstream

## Programming Language and the way of programming decision

// TODO Typescript + OOP

## Testing decision

### Decision from 12th of October 2022

* Author: Lukasz Duraj
* Drivers:
    * Testing first, Code next
    * Need a way of documenting code
    * Need of introducing changes in the future with the minimal risk
* Decision:
    * Style of testing: TDD + BDD style
    * Tools: Mocha + Chai + Sinon
* Explanations:
    * TDD:
        * We are implementing business domain first
        * We don't have any integration parts at the very beginning, so we need a way to execute our business logic
          somehow
        * Using TDD we can write unit tests that allow us to execute the code in separation from the lower layers of the
          application
        * Also, this is a way implementing test first and the code
    * BDD:
        * We implement tests in the BDD way, using the Gherkin syntax (Given/When/Then)
        * We describe tests in the declarative way, also understandable for the business
        * Then, we group unit tests into features and scenarios
        * Thanks to that we can have benefits from unit tests for classes and group them into consistent features that
          represent some system behaviour
    * Mocha:
        * Well known testing library that supports many testing interfaces (TDD/BDD/Exports/Require)
        * There is a Typescript library for Mocha: ts-mocha
    * Chai:
        * Well know assertion library that supports BDD "expect" style of assertion
        * There is a Typescript library for Chai: @types/chai
    * Sinon:
        * Mocking library with Typescript support (ts-sinon)
* Convention:
    * In unit tests we use functions from Mocha that we map to Gherkin syntax
        * "Context" into "Given" - what is the current state
        * "Describe" into "When" - what action is done
        * "It" into "Then" - what result do we expect
    * Unit tests should be grouped into `*.feature.ts` files
        * Ever file should contain a single "feature" that we represent as "Context" from Mocha
        * Every "feature" should contain one to many "scenarios" represented as "Describe" from Mocha
        * Inside "scenario" we should include all unit tests files that contain all steps for the specific scenario
    * Executing tests we run only "*.feature.ts" files
* Other options:
    * Using Cucumber.js
        * Author never worked with Cucumber
        * It seems it requires duplication of features into features execution
        * The Context/Describe/It nesting seems to be more suitable and readable from author perspective
        * The result of tests after execution of all suites is a good enough documentation

## Shared tool libraries decisions