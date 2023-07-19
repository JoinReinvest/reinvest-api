import AddCalculation from 'Documents/UseCases/AddCalculation'
import GetCalculation from 'Documents/UseCases/GetCalculation'
import { IdGeneratorInterface } from 'IdGenerator/IdGenerator'

export class CalculationsController {
    public static getClassName = (): string => 'CalculationsController'
    private idGenerator: IdGeneratorInterface
    private addCalculation: AddCalculation
    private getCalculation: GetCalculation

    constructor (idGenerator: IdGeneratorInterface, addCalculation: AddCalculation, getCalculation: GetCalculation) {
        this.idGenerator = idGenerator
        this.addCalculation = addCalculation
        this.getCalculation = getCalculation
    }

    public async add (email: string, calculations: string): Promise<boolean | string> {
        const newID = this.idGenerator.createUuid()

        try {
            await this.addCalculation.execute(newID, email, calculations)

            return newID
        } catch (error: any) {
            console.error(`Problem with saving calculations`, error)

            return false
        }
    }

    public async get (id: string): Promise<boolean | string> {
        try {
            const calculationData = await this.getCalculation.execute(id)

            return calculationData
        } catch (error: any) {
            console.error(`Problem with getting calculations`, error)

            return false
        }
    }
}
