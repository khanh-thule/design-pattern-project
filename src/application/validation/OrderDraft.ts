import { Pizza } from '../../domain/pizza/Pizza';

export interface OrderDraft {
  readonly pizzas: readonly Pizza[];
  readonly zipCode: string;
  readonly date: Date;
}
