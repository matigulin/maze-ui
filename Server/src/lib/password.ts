import bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = 12;

export async function hashSecret(value: string): Promise<string> {
  return bcrypt.hash(value, BCRYPT_ROUNDS);
}

export async function verifySecret(value: string, hash: string): Promise<boolean> {
  return bcrypt.compare(value, hash);
}
