import {expect} from "chai";
import NorthCapitalRequester from "./NorthCapitalRequester";
import {NORTH_CAPITAL_CONFIG} from "../../../config";
import expectThrowsAsync from "../expectThrowsAsync";

const {CLIENT_ID, DEVELOPER_API_KEY, API_URL} = NORTH_CAPITAL_CONFIG;

describe('Given I am an issuer and I am an admin', () => {
    const requester = new NorthCapitalRequester(CLIENT_ID, DEVELOPER_API_KEY, API_URL)

    context('When I have created offer without escrow account', () => {
        const offeringId = NORTH_CAPITAL_CONFIG.OFFERING_ID;

        it('Then I should be able to create an escrow account', async () => {
            const escrowAccountStatus = await requester.createEscrowAccount(
                offeringId,
                "110.000000",
                "Test Bank Name",
                "123456789",
                "Test Escrow Account"
            );

            expect(escrowAccountStatus).is.equal('approved')
        });

    });

    context('When I have created offer with an escrow account', () => {
        const offeringId = NORTH_CAPITAL_CONFIG.OFFERING_ID;

        it('Then I should not be able to create an escrow account', async () => {
            const createEscrowAccountRequest = requester.createEscrowAccount(
                offeringId,
                "110.000000",
                "Test Bank Name",
                "123456789",
                "Test Escrow Account"
            );

            await expectThrowsAsync(
                () => createEscrowAccountRequest,
                "Request error: [115] This offer already has finance escrow account."
            );
        });

    });
});