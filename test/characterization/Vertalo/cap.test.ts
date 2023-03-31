import {expect} from "chai";
import VertaloRequester from "./VertaloRequester";
import {VERTALO_CONFIG} from "../../config";

const {CLIENT_ID, CLIENT_SECRET, API_URL} = VERTALO_CONFIG;

describe('Generate Cap table', () => {
    const vertaloRequester: VertaloRequester = new VertaloRequester(CLIENT_ID, CLIENT_SECRET, API_URL);

    before(async () => await vertaloRequester.preAuthorize())

    it('Query cap', async () => {
        const response= await vertaloRequester.queryCapTable("097abf82-5d47-4ada-9e17-d83fb115d237");

        expect(response).to.be.an("object")
    })
});
