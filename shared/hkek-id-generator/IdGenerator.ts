// @ts-ignore
import {v4 as uuidv4} from 'uuid';
import crypto from "crypto";

export interface IdGeneratorInterface {
    create(): string;

    generateRandomString(size: number): string
}


export class IdGenerator {
    public static getClassName = () => "IdGenerator";

    create(): string {
        return uuidv4();
    }

    generateRandomString(size: number): string {
        const hasher = crypto.createHash('sha1')
        const uuid = uuidv4()
        const currentDate = new Date()
        hasher.update(`${uuid}-${currentDate.toDateString()}`)
        const uniqueHash = hasher.digest('hex')

        return uniqueHash.substring(0, size);
    }
}