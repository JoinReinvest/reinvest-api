import {ValidationError} from "LegalEntities/Domain/ValueObject/TypeValidators";

export type EmployerInput = {
    nameOfEmployer: string,
    title: string,
    industry: string
}

export class Employer {
    private nameOfEmployer: string;
    private title: string;
    private industry: string;

    constructor(nameOfEmployer: string, title: string, industry: string) {
        this.nameOfEmployer = nameOfEmployer;
        this.title = title;
        this.industry = industry;
    }

    static create(input: EmployerInput) {
        try {
            const {nameOfEmployer, title, industry} = input;
            if (!nameOfEmployer || !title || !industry) {
                throw new Error('Missing employer fields');
            }

            return new Employer(nameOfEmployer, title, industry);
        } catch (error) {
            throw new ValidationError('WRONG_EMPLOYER_TYPE')
        }
    }

    toObject(): EmployerInput {
        return {
            nameOfEmployer: this.nameOfEmployer,
            title: this.title,
            industry: this.industry,
        }
    }
}