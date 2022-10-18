import fs from 'fs';
import * as dotenv from 'dotenv'

export default class ConfigurationCacheService {
    private readonly cacheFile: string;

    constructor(cacheFile: string = "test/artifacts/characterization.cache") {
        this.cacheFile = cacheFile;
        dotenv.config({path: this.cacheFile});
    }

    public async cacheValue(name: string, value: string | number) {
        fs.appendFile(this.cacheFile, `${name}="${value}"\n`, () => {});
    }

    readValue(value: string): string {
        if (!process.env[value]) {
            return "";
        }

        return process.env[value] as string;
    }
}