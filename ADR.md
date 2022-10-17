# Global Architecture Decision Record

## Deployment Architecture decision

### Decisions

#### Decision from 12th of October 2022

* Author: Lukasz Duraj
* Drivers:
    * This is the first iteration of the application, and we are in the MVP phase
    * We are in the learning phase of the business processes
    * Long-lived application
* Decision: Modular Monolith
* Explanations:
  // TODO
* Consequences:
    * We need to good understand the business to modularize the system in good-enough way (using Bounded Contexts)
    * We need to specify the integration context map between modules (downstream/upstream)
    * Increasing the complexity on the modules integration

* Other options:
    * Monolith - declined, because it is considered as anti-pattern and the app probably will be maintained by years (
      long-term investments)
    * Microservices - declined, there is very small team of developers and there are no scalability requirements yet

## Bounded context integration decision

// TODO Context map + downstream/upstream

## Programming Language and the way of programming decision

// TODO Typescript + OOP

## Testing decision

// TODO TDD + BDD style, chosen libraries

## Shared tool libraries decisions