import {expect} from "chai";
import VertaloRequester from "./VertaloRequester";
import {VERTALO_CONFIG} from "../../config";

const {CLIENT_ID, CLIENT_SECRET, API_URL} = VERTALO_CONFIG;

describe('Execute issuer actions', () => {
    let vertaloRequester: VertaloRequester = new VertaloRequester(CLIENT_ID, CLIENT_SECRET, API_URL);
    let assetId: string;
    let roundId: string;
    let allocationId: string;

    before(async () => await vertaloRequester.preAuthorize())

    it('create asset', async () => {
        assetId = await vertaloRequester.createAsset("Test Asset", "Preferred Equity", "500000", "Active");

        expect(assetId).to.be("string")
    })

    it('create round', async () => {
        roundId = await vertaloRequester.createRound(assetId, "Test Name", '2022-01-01', '2022-03-03', '2000000', '1.00', 'Active', 'https://dataroom.example.com');

        expect(roundId).to.be("string")
    })

    it('create allocation', async () => {
        allocationId = await vertaloRequester.createAllocation(assetId, "Test Name", '2022-01-01', '2022-03-03');

        expect(allocationId).to.be("string")
    })

    it('create investor', async () => {
        const {investorId, customerId} = await vertaloRequester.createInvestor("Bob", "bob@test.com");

        expect(investorId).to.be("string")
        expect(customerId).to.be("string")
    })

    it('create distribution', async () => {
        const {investorId, customerId} = await vertaloRequester.createInvestor("Bob", "bob@test.com");

        expect(investorId).to.be("string")
        expect(customerId).to.be("string")
    })
});