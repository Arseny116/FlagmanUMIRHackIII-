export const SEED_PRODUCTS = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Курица', unit: 'кг' },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Сыр',    unit: 'кг' },
  { id: '33333333-3333-3333-3333-333333333333', name: 'Томаты', unit: 'кг' },
  { id: '44444444-4444-4444-4444-444444444444', name: 'Тесто',  unit: 'кг' },
  { id: '55555555-5555-5555-5555-555555555555', name: 'Соус',   unit: 'л'  },
  { id: '66666666-6666-6666-6666-666666666666', name: 'Салат',  unit: 'кг' },
  { id: '77777777-7777-7777-7777-777777777777', name: 'Бекон',  unit: 'кг' },
];

export const SEED_DISHES = [
  {
    id: 'aaaaaaaa-0001-0001-0001-000000000001',
    name: 'Пицца Маргарита',
    price: 550,
    composition: [
      { productId: '44444444-4444-4444-4444-444444444444', productName: 'Тесто',  quantity: 0.25, unit: 'кг' },
      { productId: '22222222-2222-2222-2222-222222222222', productName: 'Сыр',    quantity: 0.15, unit: 'кг' },
      { productId: '33333333-3333-3333-3333-333333333333', productName: 'Томаты', quantity: 0.10, unit: 'кг' },
    ],
  },
  {
    id: 'aaaaaaaa-0002-0002-0002-000000000002',
    name: 'Пицца Пепперони',
    price: 650,
    composition: [
      { productId: '44444444-4444-4444-4444-444444444444', productName: 'Тесто',  quantity: 0.25, unit: 'кг' },
      { productId: '22222222-2222-2222-2222-222222222222', productName: 'Сыр',    quantity: 0.20, unit: 'кг' },
      { productId: '55555555-5555-5555-5555-555555555555', productName: 'Соус',   quantity: 0.08, unit: 'л'  },
      { productId: '77777777-7777-7777-7777-777777777777', productName: 'Бекон',  quantity: 0.10, unit: 'кг' },
    ],
  },
  {
    id: 'aaaaaaaa-0003-0003-0003-000000000003',
    name: 'Салат Цезарь',
    price: 490,
    composition: [
      { productId: '66666666-6666-6666-6666-666666666666', productName: 'Салат',  quantity: 0.15, unit: 'кг' },
      { productId: '11111111-1111-1111-1111-111111111111', productName: 'Курица', quantity: 0.12, unit: 'кг' },
      { productId: '22222222-2222-2222-2222-222222222222', productName: 'Сыр',    quantity: 0.03, unit: 'кг' },
    ],
  },
  {
    id: 'aaaaaaaa-0004-0004-0004-000000000004',
    name: 'Курица гриль',
    price: 690,
    composition: [
      { productId: '11111111-1111-1111-1111-111111111111', productName: 'Курица', quantity: 0.30, unit: 'кг' },
      { productId: '55555555-5555-5555-5555-555555555555', productName: 'Соус',   quantity: 0.05, unit: 'л'  },
    ],
  },
];

export const SEED_SUPPLY = {
  number: 'SUP-SEED',
  items: SEED_PRODUCTS.map((p) => ({
    productId: p.id,
    name: p.name,
    unit: p.unit,
    quantity: 10,
    shelfLifeHours: 240,
  })),
};