export const ORDER_STATUSES = ['pending', 'paid', 'delivered', 'cancelled'] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
