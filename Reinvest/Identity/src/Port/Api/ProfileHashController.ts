import * as crypto from 'crypto';
import { UUID } from 'HKEKTypes/Generics';

const algorithm = 'aes-256-cbc';
const KEY_SIZE = 32; // 256 bits for AES-256
const IV_SIZE = 16; // 128 bits for AES-256-CBC

export class ProfileHashController {
  public static getClassName = (): string => 'ProfileHashController';
  private profileIdEncryptToken: string;

  constructor(profileIdEncryptToken: string) {
    this.profileIdEncryptToken = profileIdEncryptToken;
  }

  private createKey(): Buffer {
    const hash = crypto.createHash('sha256').update(this.profileIdEncryptToken).digest();

    return hash.slice(0, KEY_SIZE); // Ensure the key is 32 bytes
  }

  private deriveIV(): Buffer {
    const hash = crypto.createHash('sha256').update(this.profileIdEncryptToken).digest();

    return hash.slice(0, IV_SIZE); // Ensure the IV is 16 bytes
  }

  async encrypt(profileId: UUID): Promise<boolean | string> {
    try {
      const key = this.createKey();
      const iv = this.deriveIV();
      const cipher = crypto.createCipheriv(algorithm, key, iv);

      return cipher.update(profileId, 'utf-8', 'hex') + cipher.final('hex');
    } catch (error: any) {
      console.log(error.message);

      return false;
    }
  }

  async decrypt(encryptedToken: string): Promise<boolean | UUID> {
    try {
      const key = this.createKey();
      const iv = this.deriveIV();
      const decipher = crypto.createDecipheriv(algorithm, key, iv);

      return decipher.update(encryptedToken, 'hex', 'utf-8') + decipher.final('utf-8');
    } catch (error: any) {
      console.log(error.message);

      return false;
    }
  }
}
