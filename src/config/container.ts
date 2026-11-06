import { BrandRegistry } from '../domain/brand/BrandRegistry';
import { DaMichele } from '../domain/brand/brands/DaMichele';
import { Pizzium } from '../domain/brand/brands/Pizzium';
import { Rossopomodoro } from '../domain/brand/brands/Rossopomodoro';

export const buildContainer = () => {
  const brands = new BrandRegistry([new DaMichele(), new Rossopomodoro(), new Pizzium()]);

  return { brands };
};

export type Container = ReturnType<typeof buildContainer>;
