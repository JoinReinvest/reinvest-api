import { v4 as uuidv4 } from 'uuid';

export interface IdGeneratorInterface {
  createNumericId(size: number): string;

  createUuid(): string;
}

export class IdGenerator implements IdGeneratorInterface {
  public static getClassName = () => 'IdGenerator';

  createUuid(): string {
    return uuidv4();
  }

  createNumericId(size: number): string {
    const generateSingleNumber = () => Math.floor(Math.random() * 10);
    let numericId = '';

    for (let i = 0; i < size; i++) {
      numericId += generateSingleNumber();
    }

    return numericId;
  }
}
