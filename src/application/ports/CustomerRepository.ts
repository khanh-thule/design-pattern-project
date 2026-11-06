import { Customer } from '../../domain/customer/Customer';

export interface CustomerRepository {
  findAll(): Promise<Customer[]>;
}
