import crypto from "crypto";

export class CrcService {
    static generateCrc(data: string[]): string {
        const singleString = data.reduce((accumulator: string, value: string): string => {
            return accumulator + value.trim().toLowerCase();
        });

        return crypto
            .createHash('sha1')
            .update(singleString)
            .digest('hex')
    }

    static verifyCrc(data: string[], crc: string): boolean {
        return CrcService.generateCrc(data) === crc;
    }
}