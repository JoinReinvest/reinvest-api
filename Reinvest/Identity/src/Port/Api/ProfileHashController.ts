import * as crypto from 'crypto'
import { UUID } from 'HKEKTypes/Generics'
import { PROFILEID_HASH_KEY } from 'Reinvest/config'

const algorithm = 'aes-256-cbc'
const KEY_SIZE = 32  // 256 bits for AES-256
const IV_SIZE = 16  // 128 bits for AES-256-CBC

export class ProfileHashController {
    public static getClassName = (): string => 'ProfileHashController'

    private static createKey (profileId: string): Buffer {
        const hash = crypto.createHash('sha256').update(profileId).digest()
        return hash.slice(0, KEY_SIZE)  // Ensure the key is 32 bytes
    }

    private static deriveIV (profileId: string): Buffer {
        const hash = crypto.createHash('sha256').update(profileId + PROFILEID_HASH_KEY).digest()
        return hash.slice(0, IV_SIZE)  // Ensure the IV is 16 bytes
    }

    async encrypt (profileId: string): Promise<boolean | string> {
        try {
            const key = ProfileHashController.createKey(profileId)
            const iv = ProfileHashController.deriveIV(profileId)
            const cipher = crypto.createCipheriv(algorithm, key, iv)
            const encrypted = cipher.update(profileId, 'utf-8', 'hex') + cipher.final('hex')

            return encrypted
        } catch (error: any) {
            console.log(error.message)
            return false
        }
    }

    async decrypt(encryptedData: string, profileId: string): Promise<boolean | string> {
        try {
            const key = ProfileHashController.createKey(profileId);
            const iv = ProfileHashController.deriveIV(profileId);
            const decipher = crypto.createDecipheriv(algorithm, key, iv);
            const decrypted = decipher.update(encryptedData, 'hex', 'utf-8') + decipher.final('utf-8');

            return decrypted;
        } catch (error: any) {
            console.log(error.message);
            return false;
        }
    }
}
