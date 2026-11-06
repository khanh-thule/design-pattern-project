import { PizzaRecipe } from '../pizza/Pizza';

export type OrderLine = PizzaRecipe & { label: string; price: number };
