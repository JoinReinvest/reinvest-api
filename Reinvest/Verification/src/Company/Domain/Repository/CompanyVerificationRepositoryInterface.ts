import {CompanyVerification} from "../CompanyVerification";

export interface CompanyVerificationRepositoryInterface {
    save(companyVerifications: CompanyVerification[]): void;
}