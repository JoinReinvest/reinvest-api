# Architecture Decision Record for Trading Main

## Trading responsibilities:

* 

## Application Architecture decision

### Decisions

#### Decision of November 17, 2022

* Author: Lukasz Duraj
* Drivers:
    * 
* Decision: 3-layered architecture
    - Port: input data from HTTP/ or ports/adapters to other modules
    - IntegrationLogic: integration logic between
    - Adapter: output data to DB/Filesystem/Queue/North Capital/Vertalo
    - Dependencies flow: Downstream--->Upstream (upstream is not aware of downstream)
    - Execution flow: Port ---> Integration -----> OutputPort
* Context:
    - to add
* Consequences:
    - 

## Testing

### Decisions

#### Decision of November 17, 2022

* Author: Lukasz Duraj
* Drivers:
* Decision: Only integration testing
* Explanations:
