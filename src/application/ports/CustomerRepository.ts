import { Customer } from '../../domain/customer/Customer';

export interface CustomerRepository {
  findAll(): Promise<Customer[]>;
  findById(id: string): Promise<Customer | null>;
  findPasswordHash(id: string): Promise<string | null>;
}
