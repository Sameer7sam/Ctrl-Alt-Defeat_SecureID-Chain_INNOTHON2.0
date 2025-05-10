import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { Buffer } from 'buffer';

export class EncryptionService {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_LENGTH = 32;
  private static readonly IV_LENGTH = 16;
  private static readonly AUTH_TAG_LENGTH = 16;

  static async encrypt(data: string, key: string): Promise<string> {
    const iv = randomBytes(this.IV_LENGTH);
    const cipher = createCipheriv(this.ALGORITHM, Buffer.from(key), iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return JSON.stringify({
      iv: iv.toString('hex'),
      encrypted,
      authTag: authTag.toString('hex')
    });
  }

  static async decrypt(encryptedData: string, key: string): Promise<string> {
    const { iv, encrypted, authTag } = JSON.parse(encryptedData);
    
    const decipher = createDecipheriv(
      this.ALGORITHM,
      Buffer.from(key),
      Buffer.from(iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
} 