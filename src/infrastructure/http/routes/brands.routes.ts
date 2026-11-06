import { Router } from 'express';
import { BrandRegistry } from '../../../domain/brand/BrandRegistry';

export const brandsRouter = (brands: BrandRegistry): Router => {
  const router = Router();

  router.get('/', (_req, res) => {
    res.json(brands.list().map((b) => ({ id: b.id, name: b.name })));
  });

  router.get('/:brandId/menu', (req, res) => {
    const brand = brands.get(req.params.brandId);
    const sizes = brand.availableSizes();

    res.json({
      brand: { id: brand.id, name: brand.name },
      sizes,
      pizzas: brand.menu().map((entry) => ({
        name: entry.name,
        prices: Object.fromEntries(sizes.map((size) => [size, brand.orderPizza(entry.name, size).price()])),
      })),
    });
  });

  return router;
};
