import { MenuPizza } from '../../domain/pizza/MenuPizza';

export interface OrderDraft {
  readonly pizzas: readonly MenuPizza[];
  readonly zipCode: string;
  readonly date: Date;
}
