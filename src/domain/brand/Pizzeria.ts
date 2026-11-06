import { DomainError } from '../shared/DomainError';
import { MenuPizza } from '../pizza/MenuPizza';
import { Size } from '../pizza/Size';
import { SizePricingRule } from '../pizza/SizePricingRule';

export interface MenuEntry {
  readonly name: string;
  readonly basePrice: number;
}

/**
 * Factory
 * la classe abstraite contient la logique commune (orderPizza) et délègue
 * aux sous-classes la création des objets propres à chaque enseigne
 * (son menu, sa règle de prix par taille).
 */

export abstract class Pizzeria {
  abstract readonly id: string;
  abstract readonly name: string;

  protected abstract createMenu(): MenuEntry[];
  protected abstract createSizePricingRule(): SizePricingRule;

  menu(): MenuEntry[] {
    return this.createMenu();
  }

  availableSizes(): readonly Size[] {
    return this.createSizePricingRule().availableSizes;
  }

  orderPizza(name: string, size: Size): MenuPizza {
    const entry = this.createMenu().find((e) => e.name.toLowerCase() === name.toLowerCase());
    if (!entry) {
      throw new DomainError(`"${name}" n'est pas au menu de ${this.name}`, 'UNKNOWN_PIZZA');
    }
    return new MenuPizza(entry.name, entry.basePrice, size, this.createSizePricingRule());
  }
}
