import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export interface UniqueTokenGeneratorInterface {
  generateRandomString(size: number): string;
}

export class UniqueTokenGenerator {
  public static getClassName = () => 'UniqueTokenGenerator';

  generateRandomString(size: number): string {
    if (size > 32) {
      throw new Error('Size exceeded. Max size is 32 digits');
    }

    const hasher = crypto.createHash('sha1');
    const uuid = uuidv4();
    const currentDate = new Date();
    hasher.update(`${uuid}-${currentDate.toDateString()}`);
    const uniqueHash = hasher.digest('hex');

    return uniqueHash.substring(0, size);
  }
}
