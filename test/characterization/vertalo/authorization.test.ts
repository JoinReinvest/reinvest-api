import axios from "axios";
import {expect} from "chai";

const expectThrowsAsync = async (method: any, errorMessage: string) => {
    let error = null
    try {
        await method()
    } catch (err: any) {
        error = err
    }
    expect(error.message).to.equal(errorMessage)
}

describe('Generate Token', () => {
    it('returns 403 when wrong secret provided', async () => {
        await expectThrowsAsync(() => axios
                .get('https://sandbox.vertalo.com/authenticate/token/login?client_id=client_id&client_secret=secret'),
            "Request failed with status code 403")
    })
});