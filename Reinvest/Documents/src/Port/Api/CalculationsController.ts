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

    public async add (data: string): Promise<boolean> {
        const newID = this.idGenerator.createUuid()

        try {
             await this.addCalculation.execute( newID, data);

            return true
        } catch (error: any) {
            console.error(`Problem with saving calculations`, error)

            return false
        }
    }

    public async get (id: string): Promise<boolean> {
        try {
            await this.getCalculation.execute( id);

            return true
        } catch (error: any) {
            console.error(`Problem with getting calculations`, error)

            return false
        }
    }
}
