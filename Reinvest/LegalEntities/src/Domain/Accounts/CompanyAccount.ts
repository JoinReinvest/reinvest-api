import {EmploymentStatus, EmploymentStatusInput} from "LegalEntities/Domain/ValueObject/EmploymentStatus";
import {ToObject} from "LegalEntities/Domain/ValueObject/ToObject";
import {Avatar, AvatarInput, CompanyDocuments, DocumentSchema} from "LegalEntities/Domain/ValueObject/Document";
import {Employer, EmployerInput} from "LegalEntities/Domain/ValueObject/Employer";
import {
    NetIncome,
    ValueRangeInput,
    NetWorth,
    AnnualRevenue,
    NumberOfEmployees
} from "LegalEntities/Domain/ValueObject/ValueRange";
import {Company, CompanyName, CompanyNameInput, CompanyTypeInput} from "LegalEntities/Domain/ValueObject/Company";
import {Address, AddressInput} from "LegalEntities/Domain/ValueObject/Address";
import {EIN, SensitiveNumberSchema} from "LegalEntities/Domain/ValueObject/SensitiveNumber";
import {Industry, ValueStringInput} from "LegalEntities/Domain/ValueObject/ValueString";
import {CompanyStakeholders, Stakeholder, StakeholderSchema} from "LegalEntities/Domain/ValueObject/Stakeholder";
import {Uuid} from "LegalEntities/Domain/ValueObject/TypeValidators";

export type CompanySchema = {
    accountId: string,
    profileId: string,
    companyName: CompanyNameInput,
    address: AddressInput,
    ein: SensitiveNumberSchema,
    annualRevenue: ValueRangeInput,
    numberOfEmployees: ValueRangeInput,
    industry: ValueStringInput,
    companyType: CompanyTypeInput,
    avatar: AvatarInput | null,
    companyDocuments: DocumentSchema[],
    stakeholders: StakeholderSchema[],
}

export class CompanyAccount {
    private profileId: string;
    private accountId: string;
    private companyName: CompanyName | null = null;
    private address: Address | null = null;
    private ein: EIN | null = null;
    private annualRevenue: AnnualRevenue | null = null;
    private numberOfEmployees: NumberOfEmployees | null = null;
    private industry: Industry | null = null;
    private companyType: Company | null = null;
    private avatar: Avatar | null = null;
    private documents: CompanyDocuments = new CompanyDocuments([]);
    private stakeholders: CompanyStakeholders = new CompanyStakeholders([]);


    constructor(profileId: string, accountId: string) {
        this.profileId = profileId;
        this.accountId = accountId;
    }

    private get(value: ToObject | null) {
        if (value === null) {
            return null;
        }

        return value.toObject();
    }


    toObject(): CompanySchema {
        return {
            accountId: this.accountId,
            profileId: this.profileId,
            companyName: this.get(this.companyName),
            address: this.get(this.address),
            ein: this.get(this.ein),
            annualRevenue: this.get(this.annualRevenue),
            numberOfEmployees: this.get(this.numberOfEmployees),
            industry: this.get(this.industry),
            companyType: this.get(this.companyType),
            avatar: this.get(this.avatar),
            companyDocuments: this.get(this.documents),
            stakeholders: this.get(this.stakeholders),
        };
    }

    static create(companyData: CompanySchema): CompanyAccount {
        const {
            profileId,
            accountId,
            companyName,
            address,
            ein,
            annualRevenue,
            numberOfEmployees,
            industry,
            companyType,
            avatar,
            stakeholders,
            companyDocuments
        } = companyData;
        const account = new CompanyAccount(profileId, accountId);

        if (companyName) {
            account.setCompanyName(CompanyName.create(companyName));
        }

        if (address) {
            account.setAddress(Address.create(address));
        }

        if (ein) {
            account.setEIN(EIN.create(ein));
        }

        if (annualRevenue) {
            account.setAnnualRevenue(AnnualRevenue.create(annualRevenue));
        }

        if (numberOfEmployees) {
            account.setNumberOfEmployees(NumberOfEmployees.create(numberOfEmployees));
        }

        if (industry) {
            account.setIndustry(Industry.create(industry));
        }

        if (companyType) {
            account.setCompanyType(Company.create(companyType));
        }

        if (avatar) {
            account.setAvatarDocument(Avatar.create(avatar));
        }

        account.setDocuments(CompanyDocuments.create(companyDocuments ?? []));
        account.setStakeholders(CompanyStakeholders.create(stakeholders ?? []));

        return account;
    }

    setCompanyName(companyName: CompanyName) {
        this.companyName = companyName;
    }

    setAvatarDocument(avatar: Avatar) {
        this.avatar = avatar;
    }

    getInitials(): string {
        return "I";
    }

    setAddress(address: Address) {
        this.address = address;
    }

    setEIN(ein: EIN) {
        this.ein = ein;
    }

    setAnnualRevenue(annualRevenue: AnnualRevenue) {
        this.annualRevenue = annualRevenue;
    }

    setNumberOfEmployees(numberOfEmployees: NumberOfEmployees) {
        this.numberOfEmployees = numberOfEmployees;
    }

    setIndustry(industry: Industry) {
        this.industry = industry;
    }

    setCompanyType(company: Company) {
        this.companyType = company;
    }

    setDocuments(documents: CompanyDocuments) {
        this.documents = documents;
    }

    addDocument(document: DocumentSchema) {
        this.documents?.addDocument(document);
    }

    removeDocument(document: DocumentSchema) {
        this.documents?.removeDocument(document);
    }

    setStakeholders(companyStakeholders: CompanyStakeholders) {
        this.stakeholders = companyStakeholders;
    }

    addStakeholder(stakeholder: Stakeholder) {
        this.stakeholders?.addStakeholder(stakeholder);
    }

    removeStakeholder(id: Uuid) {
        this.stakeholders?.removeStakeholder(id);
    }
}