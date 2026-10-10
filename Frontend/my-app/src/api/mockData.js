export const PRODUCTS = [
  { id: 1, name: 'Курица', unit: 'кг' },
  { id: 2, name: 'Сыр',    unit: 'кг' },
  { id: 3, name: 'Томаты', unit: 'кг' },
  { id: 4, name: 'Тесто',  unit: 'кг' },
  { id: 5, name: 'Соус',   unit: 'л'  },
  { id: 6, name: 'Салат',  unit: 'кг' },
  { id: 7, name: 'Бекон',  unit: 'кг' },
];

export const DISHES = [
  { id: 1, name: 'Пицца Маргарита', price: 550, composition: [
    { productId: 4, quantity: 0.25 },
    { productId: 2, quantity: 0.15 },
    { productId: 3, quantity: 0.10 },
  ]},
  { id: 2, name: 'Курица гриль', price: 690, composition: [
    { productId: 1, quantity: 0.30 },
    { productId: 5, quantity: 0.05 },
  ]},
  { id: 3, name: 'Пицца Пепперони', price: 650, composition: [
    { productId: 4, quantity: 0.25 },
    { productId: 2, quantity: 0.20 },
    { productId: 5, quantity: 0.08 },
    { productId: 7, quantity: 0.10 },
  ]},
  { id: 4, name: 'Салат Цезарь', price: 490, composition: [
    { productId: 6, quantity: 0.15 },
    { productId: 1, quantity: 0.12 },
    { productId: 2, quantity: 0.03 },
  ]},
];

export const INITIAL_BATCHES = [
  { id: 1, productId: 1, quantity: 12,  suppliedAt: '2026-10-08T10:00:00Z', expiresAt: '2026-10-11T10:00:00Z', supplyId: 1 },
  { id: 2, productId: 2, quantity: 3,   suppliedAt: '2026-10-09T10:00:00Z', expiresAt: '2026-10-20T10:00:00Z', supplyId: 1 },
  { id: 3, productId: 3, quantity: 5,   suppliedAt: '2026-10-09T10:00:00Z', expiresAt: '2026-10-13T10:00:00Z', supplyId: 2 },
  { id: 4, productId: 4, quantity: 8,   suppliedAt: '2026-10-05T10:00:00Z', expiresAt: '2026-10-12T10:00:00Z', supplyId: 2 },
  { id: 5, productId: 5, quantity: 2,   suppliedAt: '2026-10-01T10:00:00Z', expiresAt: '2026-10-10T20:00:00Z', supplyId: 3 },
  { id: 6, productId: 6, quantity: 1.5, suppliedAt: '2026-10-09T10:00:00Z', expiresAt: '2026-10-12T10:00:00Z', supplyId: 3 },
  { id: 7, productId: 7, quantity: 2,   suppliedAt: '2026-10-10T10:00:00Z', expiresAt: '2026-10-25T10:00:00Z', supplyId: 4 },
];

export const INITIAL_SUPPLIES = [
  { id: 1, number: 'SUP-001', createdAt: '2026-10-08T10:00:00Z' },
  { id: 2, number: 'SUP-002', createdAt: '2026-10-09T10:00:00Z' },
  { id: 3, number: 'SUP-003', createdAt: '2026-10-09T10:00:00Z' },
  { id: 4, number: 'SUP-004', createdAt: '2026-10-10T10:00:00Z' },
];