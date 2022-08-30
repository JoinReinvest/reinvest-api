import {expect} from "chai";

const expectThrowsAsync = async (method: any, errorMessage: string) => {
    let error: any = null
    try {
        await method()
    } catch (err: any) {
        error = err
    }

    const {message} = error
    expect(message).to.equal(errorMessage)
}

export default expectThrowsAsync;