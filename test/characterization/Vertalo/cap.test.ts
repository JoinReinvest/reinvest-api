import {expect} from "chai";
import VertaloRequester from "./VertaloRequester";
import {VERTALO_CONFIG} from "../../config";
import ConfigurationCacheService from "../ConfigurationCacheService";

const {CLIENT_ID, CLIENT_SECRET, API_URL, ALLOCATION_ID} = VERTALO_CONFIG;
const cacheService = new ConfigurationCacheService();

describe('Generate Cap table', () => {
    let vertaloRequester: VertaloRequester = new VertaloRequester(CLIENT_ID, CLIENT_SECRET, API_URL);
    let distributionId = cacheService.readValue('VERTALO_DISTRIBUTION_ID');

    before(async () => await vertaloRequester.preAuthorize())

    it('Query cap', async () => {
        const response= await vertaloRequester.queryCapTable("097abf82-5d47-4ada-9e17-d83fb115d237");

        expect(response).to.be.an("object")
    })
});