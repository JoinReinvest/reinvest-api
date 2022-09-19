import axios from "axios";
import expectThrowsAsync from "../expectThrowsAsync";

describe('Generate Token', () => {
    it('returns 403 when wrong secret provided', async () => {
        await expectThrowsAsync(
            () => axios.get('https://sandbox.vertalo.com/authenticate/token/login?client_id=client_id&client_secret=secret'),
            "Request failed with status code 403"
        );
    })
});