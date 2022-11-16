# Architecture Decision Record for Registration Module

## Registration responsibilities:

* integration with external vendors: North Capital (financial operator) and Vertalo (transfer agent)

## Application Architecture decision

### Decisions

#### Decision of November 16, 2022

* Author: Lukasz Duraj
* Drivers:
    * This is edge module to register objects on the North Capital and Vertalo sides.
* Decision: 3-layered architecture
    - Port: input data from HTTP/ or ports/adapters to other modules
    - Integration: integration logic between
    - Adapter: output data to DB/Filesystem/Queue/North Capital/Vertalo
    - Dependencies flow: Downstream--->Upstream (upstream is not aware of downstream)
    - Execution flow: Port ---> Integration -----> OutputPort
* Context:
    - to add
* Consequences:
    * We should not put any extra logic here, as this architecture can easily become messy and unreadable
    * Coupling data models to the infrastructure
    * The logic of creating and validating models is run inside controllers (coupling)

## Testing

### Decisions

#### Decision of November 16, 2022

* Author: Lukasz Duraj
* Drivers:
* Decision: Only integration testing
* Explanations: