import { ORDER_STATUSES } from '../../domain/order/OrderStatus';
import { INGREDIENTS } from '../../domain/pizza/custom/Ingredient';
import { SIZES } from '../../domain/pizza/Size';

const json = (schema: object) => ({ content: { 'application/json': { schema } } });
const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const error = (description: string) => ({ description, ...json(ref('Error')) });

const customerId = { name: 'customerId', in: 'path', required: true, schema: { type: 'string' }, example: 'alice' };
const orderId = { name: 'orderId', in: 'path', required: true, schema: { type: 'string' } };
const index = { name: 'index', in: 'path', required: true, schema: { type: 'integer', minimum: 0 } };
const secured = { security: [{ bearerAuth: [] }] };
const authErrors = { 401: error('Token absent, invalide ou expiré'), 403: error("Le token n'appartient pas à ce client") };

const cartResponse = { 200: { description: 'Panier', ...json(ref('Cart')) }, ...authErrors };

export const openApiSpec = {
  openapi: '3.0.3',
  info: { title: 'Pizza Marketplace API', version: '0.1.0', description: 'API de commande de pizzas multi-enseignes' },
  tags: [{ name: 'Auth' }, { name: 'Enseignes' }, { name: 'Clients' }, { name: 'Panier' }, { name: 'Commandes' }],
  paths: {
    '/health': { get: { summary: 'État du service', responses: { 200: { description: 'OK' } } } },

    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Connexion',
        requestBody: json({
          type: 'object',
          required: ['customerId', 'password'],
          properties: { customerId: { type: 'string', example: 'alice' }, password: { type: 'string', example: 'password123' } },
        }),
        responses: {
          200: { description: 'Tokens', ...json(ref('Tokens')) },
          401: error('Identifiants invalides'),
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Nouvel access token à partir du refresh token',
        requestBody: json(ref('RefreshTokenBody')),
        responses: {
          200: { description: 'Access token', ...json({ type: 'object', properties: { accessToken: { type: 'string' } } }) },
          401: error('Refresh token invalide ou expiré'),
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Révoque le refresh token',
        requestBody: json(ref('RefreshTokenBody')),
        responses: { 204: { description: 'Déconnecté' } },
      },
    },

    '/brands': {
      get: {
        tags: ['Enseignes'],
        summary: 'Liste des enseignes',
        responses: {
          200: {
            description: 'Enseignes',
            ...json({ type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' } } } }),
          },
        },
      },
    },
    '/brands/{brandId}/menu': {
      get: {
        tags: ['Enseignes'],
        summary: "Menu d'une enseigne avec les prix par taille",
        parameters: [{ name: 'brandId', in: 'path', required: true, schema: { type: 'string' }, example: 'da-michele' }],
        responses: { 200: { description: 'Menu' }, 404: error('Enseigne introuvable') },
      },
    },

    '/customers': {
      get: {
        tags: ['Clients'],
        summary: 'Liste des clients',
        responses: { 200: { description: 'Clients', ...json({ type: 'array', items: ref('Customer') }) } },
      },
    },
    '/customers/{customerId}/orders': {
      get: {
        tags: ['Commandes'],
        summary: 'Historique des commandes, la plus récente en premier (US 9)',
        ...secured,
        parameters: [customerId, { name: 'status', in: 'query', schema: { type: 'string', enum: ORDER_STATUSES } }],
        responses: {
          200: { description: 'Commandes', ...json({ type: 'array', items: ref('Order') }) },
          400: error('Statut invalide'),
          ...authErrors,
        },
      },
      post: {
        tags: ['Commandes'],
        summary: 'Passe la commande à partir du panier : validation, prix, paiement, notifications',
        ...secured,
        parameters: [customerId],
        requestBody: json({
          type: 'object',
          required: ['zipCode', 'pricing', 'paymentMethod'],
          properties: {
            zipCode: { type: 'string', example: '75001' },
            pricing: { type: 'string', example: 'standard' },
            promoCode: { type: 'string', example: 'PIZZA5' },
            paymentMethod: { type: 'string', enum: ['stripe', 'paypal', 'card'] },
          },
        }),
        responses: {
          201: { description: 'Commande payée', ...json(ref('Order')) },
          400: error('Corps invalide'),
          ...authErrors,
          404: error('Client introuvable'),
          422: error('Validation refusée (panier vide, minimum, zone, horaires, stock, réduction ou code promo…)'),
        },
      },
    },

    '/customers/{customerId}/orders/{orderId}': {
      get: {
        tags: ['Commandes'],
        summary: "Détail d'une commande, avec ses pizzas (US 9 : reconsulter)",
        ...secured,
        parameters: [customerId, orderId],
        responses: {
          200: { description: 'Commande', ...json({ allOf: [ref('Order'), { type: 'object', properties: { lines: { type: 'array', items: ref('OrderLine') } } }] }) },
          ...authErrors,
          404: error('Commande introuvable'),
        },
      },
    },
    '/customers/{customerId}/orders/{orderId}/reorder': {
      post: {
        tags: ['Commandes'],
        summary: 'Remplace le panier par les pizzas de la commande, aux prix actuels (US 9 : recommander)',
        ...secured,
        parameters: [customerId, orderId],
        responses: { ...cartResponse, 404: error('Commande introuvable') },
      },
    },

    '/customers/{customerId}/cart': {
      get: { tags: ['Panier'], summary: 'Contenu du panier', ...secured, parameters: [customerId], responses: cartResponse },
    },
    '/customers/{customerId}/cart/pizzas': {
      post: {
        tags: ['Panier'],
        summary: 'Ajoute une pizza du menu ou une pizza personnalisée',
        ...secured,
        parameters: [customerId],
        requestBody: json({ oneOf: [ref('MenuPizzaRequest'), ref('CustomPizzaRequest')] }),
        responses: {
          201: { description: 'Panier', ...json(ref('Cart')) },
          400: error('Corps invalide'),
          ...authErrors,
          422: error('Pizza inconnue, taille indisponible ou autre enseigne'),
        },
      },
    },
    '/customers/{customerId}/cart/pizzas/{index}': {
      patch: {
        tags: ['Panier'],
        summary: "Change la taille d'une pizza",
        ...secured,
        parameters: [customerId, index],
        requestBody: json({ type: 'object', required: ['size'], properties: { size: { type: 'string', enum: SIZES } } }),
        responses: { ...cartResponse, 404: error('Pizza introuvable') },
      },
      delete: {
        tags: ['Panier'],
        summary: 'Retire une pizza',
        ...secured,
        parameters: [customerId, index],
        responses: { ...cartResponse, 404: error('Pizza introuvable') },
      },
    },
    '/customers/{customerId}/cart/undo': {
      post: {
        tags: ['Panier'],
        summary: 'Annule la dernière modification (US 6)',
        ...secured,
        parameters: [customerId],
        responses: { ...cartResponse, 422: error('Rien à annuler') },
      },
    },
    '/customers/{customerId}/cart/redo': {
      post: {
        tags: ['Panier'],
        summary: 'Rétablit la modification annulée (US 6)',
        ...secured,
        parameters: [customerId],
        responses: { ...cartResponse, 422: error('Rien à rétablir') },
      },
    },

    '/orders/{orderId}/deliver': {
      post: {
        tags: ['Commandes'],
        summary: 'Passe la commande en livrée',
        parameters: [orderId],
        responses: { 200: { description: 'Commande', ...json(ref('Order')) }, 404: error('Commande introuvable'), 422: error('Transition interdite') },
      },
    },
    '/orders/{orderId}/cancel': {
      post: {
        tags: ['Commandes'],
        summary: 'Annule la commande',
        parameters: [orderId],
        responses: { 200: { description: 'Commande', ...json(ref('Order')) }, 404: error('Commande introuvable'), 422: error('Transition interdite') },
      },
    },
  },
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: {
      Error: { type: 'object', properties: { error: { type: 'string' }, message: { type: 'string' } } },
      Tokens: { type: 'object', properties: { accessToken: { type: 'string' }, refreshToken: { type: 'string' } } },
      RefreshTokenBody: { type: 'object', required: ['refreshToken'], properties: { refreshToken: { type: 'string' } } },
      Customer: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' } } },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          status: { type: 'string', enum: ORDER_STATUSES },
          createdAt: { type: 'string', format: 'date-time' },
          brandId: { type: 'string' },
          total: { type: 'number' },
        },
      },
      OrderLine: {
        type: 'object',
        description: 'Pizza du menu (pizza) ou personnalisée (base + ingredients), avec son prix au moment de la commande',
        properties: {
          label: { type: 'string' },
          size: { type: 'string', enum: SIZES },
          price: { type: 'number' },
          pizza: { type: 'string' },
          base: { type: 'string', enum: ['tomato', 'cream'] },
          ingredients: { type: 'array', items: { type: 'string', enum: Object.keys(INGREDIENTS) } },
        },
      },
      Cart: {
        type: 'object',
        properties: {
          brandId: { type: 'string', nullable: true },
          pizzas: {
            type: 'array',
            items: {
              type: 'object',
              properties: { index: { type: 'integer' }, label: { type: 'string' }, size: { type: 'string' }, price: { type: 'number' } },
            },
          },
          subtotal: { type: 'number' },
        },
      },
      MenuPizzaRequest: {
        type: 'object',
        required: ['brandId', 'pizza', 'size'],
        properties: {
          brandId: { type: 'string', example: 'da-michele' },
          pizza: { type: 'string', example: 'Margherita' },
          size: { type: 'string', enum: SIZES },
        },
      },
      CustomPizzaRequest: {
        type: 'object',
        required: ['brandId', 'base', 'size', 'ingredients'],
        properties: {
          brandId: { type: 'string', example: 'da-michele' },
          base: { type: 'string', enum: ['tomato', 'cream'] },
          size: { type: 'string', enum: SIZES },
          ingredients: { type: 'array', items: { type: 'string', enum: Object.keys(INGREDIENTS) } },
        },
      },
    },
  },
};
