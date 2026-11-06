# 🍕 Pizza Marketplace API

API de commande de pizzas pour plusieurs enseignes, réalisée dans le cadre du module **Design Patterns**.

## Design Pattern utilisés:
- US 1: Factory: la classe abstraite contient la logique commune (orderPizza) et délègue aux sous-classes la création des objets propres à chaque enseigne(son menu, sa règle de prix par taille).
- US 2: Strategy: chaque réduction (standard, Happy Hour, code promo, fidélité) est un algorithme interchangeable derrière l'interface `PricingStrategy`, donc ajouter une réduction revient à créer une nouvelle classe sans modifier le code existant (Open/Closed).
- US 3: Chain of Responsibility : chaque règle de validation est un maillon indépendant qui rejette la commande ou la passe au suivant, donc la première erreur arrête la chaîne et ajouter une règle revient à ajouter un maillon.
- US 4: Adapter + port hexagonal : le métier ne dépend que du port `PaymentGateway`, et chaque moyen de paiement (signature différente) est branché via un adapter, donc on passe de l'un à l'autre sans modifier le code métier.

## Stack

- **TypeScript** + **Node.js 22**
- **Express 5** : API HTTP
- **Prisma** + **PostgreSQL** : persistance
- **Zod** : validation des entrées et de la configuration
- **Vitest** : tests
- **Docker / Docker Compose**

## Démarrage

### Avec Docker (API + PostgreSQL)

```bash
docker compose up --build
```

L'API est disponible sur http://localhost:3000. Pour vérifier qu'elle répond : `GET /health`.

### En local

```bash
cp .env.example .env
docker compose up -d db      # lance uniquement PostgreSQL
npm install                  # lance aussi prisma generate
npm run prisma:migrate       # crée et applique les migrations
npm run dev
```

### Scripts

| Script                   | Rôle                                              |
| ------------------------ | ------------------------------------------------- |
| `npm run dev`            | Lance le serveur et le recharge à chaque modification (tsx) |
| `npm run build`          | Compile TypeScript dans `dist/`                   |
| `npm start`              | Lance la version compilée                         |
| `npm run typecheck`      | Vérifie les types                                 |
| `npm test`               | Lance les tests (Vitest)                          |
| `npm run prisma:migrate` | Crée et applique une migration (dev)              |
| `npm run prisma:deploy`  | Applique les migrations (prod)                    |
| `npm run prisma:studio`  | Ouvre Prisma Studio                               |

```

