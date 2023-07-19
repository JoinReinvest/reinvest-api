import { CalculationsRepository } from 'Documents/Adapter/Repository/CalculationsRepository'
import { UUID } from 'HKEKTypes/Generics'

class AddCalculation {
    static getClassName = (): string => 'AddCalculation'
    private calculationsRepository: CalculationsRepository

    constructor (calculationsRepository: CalculationsRepository) {
        this.calculationsRepository = calculationsRepository
    }

    async execute (id: UUID, email:string, data: string) {
        return this.calculationsRepository.create(id, email, data)
    }
}

export default AddCalculation
