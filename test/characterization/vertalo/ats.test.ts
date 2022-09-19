import {expect} from "chai";
import VertaloRequester from "./VertaloRequester";
import {VERTALO_CONFIG} from "../../../config";

const {CLIENT_ID, CLIENT_SECRET, API_URL} = VERTALO_CONFIG;

describe('Given I am an admin', () => {
    let vertaloRequester: VertaloRequester = new VertaloRequester(CLIENT_ID, CLIENT_SECRET, API_URL);

    before(async () => await vertaloRequester.preAuthorize())

    context('When I want to transfer shares to an investor', async () => {

        it('Then I should be able to create an investor', async () => {
            const investorId = await vertaloRequester.createAtsInvestor("Bob", "bob@test.com");

            expect(investorId).to.be("string")
        })
    });


});