# Architecture Decision Record for Legal Entities Module

## Application Architecture decision

### Decisions

#### Decision of October 18, 2022

* Author: Lukasz Duraj
* Drivers:
    * This is simple CRUD
* Decision: 2-layered architecture
    - InputPort: input data from HTTP/ or ports/adapters to other modules
    - OutputAdapter: output data to DB/Filesystem/Queue
    - Dependencies flow: (InputPort)Downstream--Upstream(OutputPort) (upstream is not aware of downstream)
    - Execution flow: InputPort ---> OutputPort
* Explanations:
    - Legal entities' data is gathered only to display in the UI and push it to the external system
    - No logic behind it
    - Simple CRUD
    - Pushing PDF documents to an external filesystem
    - No need to use some fancy architecture as it would be over-engineering
* Consequences:
    * We should not put any extra logic here, as this architecture can easily become messy and unreadable
    * Coupling data models to the infrastructure
    * The logic of creating and validating models is run inside controllers (coupling)

## Testing

### Decisions

#### Decision of October 26, 2022

* Author: Lukasz Duraj
* Drivers:
    * This is simple CRUD
* Decision: Only integration testing
* Explanations:
    - We just create model objects, validate them and save to DB/S3 and send an event
    - No logic to test with units