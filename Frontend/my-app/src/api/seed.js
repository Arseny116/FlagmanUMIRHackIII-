export const SEED_PRODUCTS = [
  { id: '88888888-1111-1111-1111-111111111111', name: 'Курица', unit: 'кг' },
  { id: '88888888-2222-2222-2222-222222222222', name: 'Сыр',    unit: 'кг' },
  { id: '88888888-3333-3333-3333-333333333333', name: 'Томаты', unit: 'кг' },
  { id: '88888888-5555-5555-5555-555555555555', name: 'Соус',   unit: 'л'  },
  { id: '88888888-6666-6666-6666-666666666666', name: 'Салат',  unit: 'кг' },
  { id: '88888888-7777-7777-7777-777777777777', name: 'Бекон',  unit: 'кг' },
  { id: '88888888-4444-4444-4444-444444444444', name: 'Тесто',  unit: 'кг' },
];

export const SEED_DISHES = [
  {
    id: '99999999-0001-0001-0001-000000000001',
    name: 'Пицца Маргарита',
    price: 550,
    composition: [
      { productId: '88888888-4444-4444-4444-444444444444', productName: 'Тесто',  quantity: 0.25, unit: 'кг' },
      { productId: '88888888-2222-2222-2222-222222222222', productName: 'Сыр',    quantity: 0.15, unit: 'кг' },
      { productId: '88888888-3333-3333-3333-333333333333', productName: 'Томаты', quantity: 0.10, unit: 'кг' },
    ],
  },
  {
    id: '99999999-0002-0002-0002-000000000002',
    name: 'Пицца Пепперони',
    price: 650,
    composition: [
      { productId: '88888888-4444-4444-4444-444444444444', productName: 'Тесто',  quantity: 0.25, unit: 'кг' },
      { productId: '88888888-2222-2222-2222-222222222222', productName: 'Сыр',    quantity: 0.20, unit: 'кг' },
      { productId: '88888888-5555-5555-5555-555555555555', productName: 'Соус',   quantity: 0.08, unit: 'л'  },
      { productId: '88888888-7777-7777-7777-777777777777', productName: 'Бекон',  quantity: 0.10, unit: 'кг' },
    ],
  },
  {
    id: '99999999-0003-0003-0003-000000000003',
    name: 'Салат Цезарь',
    price: 490,
    composition: [
      { productId: '88888888-6666-6666-6666-666666666666', productName: 'Салат',  quantity: 0.15, unit: 'кг' },
      { productId: '88888888-1111-1111-1111-111111111111', productName: 'Курица', quantity: 0.12, unit: 'кг' },
      { productId: '88888888-2222-2222-2222-222222222222', productName: 'Сыр',    quantity: 0.03, unit: 'кг' },
    ],
  },
  {
    id: '99999999-0004-0004-0004-000000000004',
    name: 'Курица гриль',
    price: 690,
    composition: [
      { productId: '88888888-1111-1111-1111-111111111111', productName: 'Курица', quantity: 0.30, unit: 'кг' },
      { productId: '88888888-5555-5555-5555-555555555555', productName: 'Соус',   quantity: 0.05, unit: 'л'  },
    ],
  },
];

const random = (min, max) => Math.random() * (max - min) + min;

const round2 = (n) => Math.round(n * 100) / 100;

export const SEED_SUPPLY = {
  number: 'SUP-SEED',
  items: SEED_PRODUCTS.map((p) => {
    const config = {
      'Курица': { minQty: 5,  maxQty: 15, minH: 24,  maxH: 72  },
      'Сыр':    { minQty: 3,  maxQty: 10, minH: 48,  maxH: 120 },
      'Томаты': { minQty: 4,  maxQty: 12, minH: 24,  maxH: 96  },
      'Тесто':  { minQty: 5,  maxQty: 15, minH: 48,  maxH: 96  },
      'Соус':   { minQty: 2,  maxQty: 8,  minH: 72,  maxH: 240 },
      'Салат':  { minQty: 2,  maxQty: 8,  minH: 12,  maxH: 48  },
      'Бекон':  { minQty: 1,  maxQty: 5,  minH: 96,  maxH: 240 },
    }[p.name] ?? { minQty: 3, maxQty: 10, minH: 48, maxH: 120 };

    return {
      productId: p.id,
      name: p.name,
      unit: p.unit,
      quantity: round2(random(config.minQty, config.maxQty)),
      shelfLifeHours: Math.round(random(config.minH, config.maxH)),
    };
  }),
};