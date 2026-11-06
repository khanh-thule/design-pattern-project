import { DomainError } from '../shared/DomainError';
import { round2 } from '../shared/money';
import { SIZES, Size } from './Size';

export interface SizePricingRule {
  readonly availableSizes: readonly Size[];
  apply(basePrice: number, size: Size): number;
}

abstract class BaseSizePricingRule implements SizePricingRule {
  abstract readonly availableSizes: readonly Size[];

  apply(basePrice: number, size: Size): number {
    if (!this.availableSizes.includes(size)) {
      throw new DomainError(`Taille ${size} indisponible pour cette enseigne`, 'SIZE_UNAVAILABLE');
    }
    return round2(this.compute(basePrice, size));
  }

  protected abstract compute(basePrice: number, size: Size): number;
}

export class AdditiveSizePricing extends BaseSizePricingRule {
  readonly availableSizes = SIZES;

  constructor(private readonly deltas: Record<Size, number>) {
    super();
  }

  protected compute(basePrice: number, size: Size): number {
    return basePrice + this.deltas[size];
  }
}

export class MultiplicativeSizePricing extends BaseSizePricingRule {
  readonly availableSizes = SIZES;

  constructor(private readonly factors: Record<Size, number>) {
    super();
  }

  protected compute(basePrice: number, size: Size): number {
    return basePrice * this.factors[size];
  }
}

export class SingleSizePricing extends BaseSizePricingRule {
  readonly availableSizes: readonly Size[];

  constructor(onlySize: Size) {
    super();
    this.availableSizes = [onlySize];
  }

  protected compute(basePrice: number): number {
    return basePrice;
  }
}
