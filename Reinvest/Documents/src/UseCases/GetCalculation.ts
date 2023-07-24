import { CalculationsRepository } from 'Documents/Adapter/Repository/CalculationsRepository'
import { UUID } from 'HKEKTypes/Generics'

class GetCalculation {
    static getClassName = (): string => 'GetCalculation'
    private calculationsRepository: CalculationsRepository

    constructor (calculationsRepository: CalculationsRepository) {
        this.calculationsRepository = calculationsRepository
    }

    async execute (id: UUID) {
        return this.calculationsRepository.get(id)
    }
}

export default GetCalculation
