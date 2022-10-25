# Architecture Decision Record for Legal Entities Module

## Application Architecture decision

### Decisions

#### Decision of October 18, 2022

* Author: Lukasz Duraj
* Drivers:
    * clear and easy to understand business rules/steps of the process
    * ability to mix user's and system's actions within one process
* Decision: Layered architecture
* Explanations:
    Creating legal entities is a process that contains a lot of factors. To handle it in a clear way we are going to use 
    hexagonal architecture. 
* Consequences:
    * increase the complexity as we need to go through all layers in the specific direction
    * using CQRS introduces extra proxy between actual call and execution of code
* Other options:
    * 2-3 layered application - declined as we need to make decisions based on events in the system