export interface PasswordHasher {
  verify(password: string, hash: string): Promise<boolean>;
}
