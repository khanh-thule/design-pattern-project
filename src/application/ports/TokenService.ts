export interface TokenService {
  sign(customerId: string): string;
  verify(token: string): string;
}
