import { NotFoundError } from '../shared/DomainError';
import { Pizzeria } from './Pizzeria';

export class BrandRegistry {
  private readonly brands = new Map<string, Pizzeria>();

  constructor(brands: Pizzeria[]) {
    brands.forEach((brand) => this.register(brand));
  }

  register(brand: Pizzeria): void {
    this.brands.set(brand.id, brand);
  }

  get(id: string): Pizzeria {
    const brand = this.brands.get(id);
    if (!brand) throw new NotFoundError(`Enseigne "${id}"`);
    return brand;
  }

  list(): Pizzeria[] {
    return [...this.brands.values()];
  }
}
