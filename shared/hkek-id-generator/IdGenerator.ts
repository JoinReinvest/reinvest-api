// @ts-ignore
import {v4 as uuidv4} from 'uuid';

export interface IdGeneratorInterface {
    create(): string;
}


export class IdGenerator {
    public static getClassName = () => "IdGenerator";

    create(): string {
        return uuidv4();
    }
}