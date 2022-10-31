# Architecture Decision Record for Investments module

## Application Architecture decision

### Decisions

#### Decision of October 12, 2022

* Author: Lukasz Duraj
* Drivers:
    * clear and easy to understand business rules/steps of the process
    * ability to mix user's and system's actions within one process
* Decision: Using Hexagonal Architecture + CQRS
* Context:
  The Investment module implements Transaction process manager that coordinates the process of buying shares.
  The process is quite long, complex and depends on many events.
  We need a clear distinction between the decision the process manager is made and execution of that decision.
* Consequences:
    * increase the complexity as we need to go through all layers in the specific direction
    * using CQRS introduces extra proxy between actual call and execution of code
* Other options:
    * 2-3 layered application - declined as we need to make decisions based on events in the system