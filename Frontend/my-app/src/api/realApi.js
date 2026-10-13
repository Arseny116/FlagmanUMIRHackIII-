import { SEED_PRODUCTS, SEED_DISHES, SEED_SUPPLY } from './seed';

let seedPromise = null;

async function request(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let body = null;
    try { body = JSON.parse(text); } catch {}

    const error = new Error(body?.error || body?.title || `HTTP ${res.status}`);
    error.status = res.status;
    error.body = body;
    throw error;
  }

  return res.status === 204 ? null : res.json();
}

const adaptStock = (s) => ({
  id: s.productId,
  name: s.name,
  unit: s.unit === 'string' ? 'шт' : s.unit,
  totalQuantity: s.totalQuantity,
  batchesCount: s.batchCount,
  nearestExpiresAt: s.nearestExpiresAt,
  availableQuantity: s.availableQuantity,
  expiredQuantity: s.expiredQuantity,
});

const adaptBatch = (b) => ({
  id: b.batchId,
  productId: b.productId,
  productName: b.productName,
  unit: b.unit === 'string' ? 'шт' : b.unit,
  quantity: b.remainingQuantity,
  suppliedAt: b.receivedAt,
  expiresAt: b.expiresAt,
  hoursLeft: Math.floor(b.remainingHours ?? 0),
  isExpired: b.isExpired,
  supplyId: b.supplyId,
  supplyNumber: b.supplyNumber,
});

const adaptDish = (d) => ({
  id: d.id,
  name: d.name,
  price: 0,
  composition: (d.recipeItems ?? []).map((r) => ({
    productId: r.productId,
    productName: r.productName ?? 'Неизвестно',
    quantity: r.quantity,
    unit: r.unit ?? 'шт',
  })),
});

export async function getStock() {
  const raw = await request('/api/stock');
  return raw.map(adaptStock);
}

export async function getBatches(productId) {
  const q = productId ? `?productId=${productId}` : '';
  const raw = await request(`/api/stock/batches${q}`);
  return raw.map(adaptBatch);
}

export async function getDishes() {
  const [dishesRaw, stock] = await Promise.all([
    request('/api/dishes'),
    request('/api/stock').catch(() => []),
  ]);

  const stockMap = new Map(
    (stock ?? []).map((s) => [
      s.productId,
      { name: s.name, unit: s.unit === 'string' ? 'шт' : s.unit },
    ])
  );

  return dishesRaw.map((d) => ({
    id: d.id,
    name: d.name,
    price: 0,
    composition: (d.recipeItems ?? []).map((r) => {
      const product = stockMap.get(r.productId);
      return {
        productId: r.productId,
        productName: product?.name ?? 'Неизвестно',
        quantity: r.quantity,
        unit: product?.unit ?? 'шт',
      };
    }),
  }));
}

export async function getProducts() {
  const raw = await request('/api/stock');
  return raw.map((s) => ({
    id: s.productId,
    name: s.name,
    unit: s.unit === 'string' ? 'шт' : s.unit,
  }));
}

export async function getExpiring(hours = 24) {
  const all = await getBatches();
  return all.filter((b) => b.hoursLeft <= hours && !b.isExpired);
}

export async function getStopList() {
  const [dishes, stock] = await Promise.all([getDishes(), getStock()]);
  const stockMap = new Map(stock.map((s) => [s.id, s.totalQuantity]));

  return dishes
    .map((dish) => {
      const missing = [];
      for (const need of dish.composition) {
        const have = stockMap.get(need.productId) ?? 0;
        if (have < need.quantity) {
          missing.push({
            productId: need.productId,
            productName: need.productName,
            need: need.quantity,
            have,
            unit: need.unit,
          });
        }
      }
      return { id: dish.id, name: dish.name, missing };
    })
    .filter((d) => d.missing.length > 0);
}

export async function getHotOffers() {
  const [dishes, batches, stoplist] = await Promise.all([
    getDishes(), getBatches(), getStopList(),
  ]);
  const stopIds = new Set(stoplist.map((d) => d.id));

  return dishes
    .filter((dish) => !stopIds.has(dish.id))
    .map((dish) => {
      let score = 0;
      const reasons = [];
      for (const need of dish.composition) {
        const soonest = batches
          .filter((b) => b.productId === need.productId && !b.isExpired)
          .sort((a, b) => a.hoursLeft - b.hoursLeft)[0];
        if (soonest && soonest.hoursLeft < 48) {
          score += ((48 - soonest.hoursLeft) / 48) * need.quantity * 10;
          reasons.push(
            `${soonest.productName}: ${soonest.quantity} ${soonest.unit}, истекает через ${soonest.hoursLeft} ч`
          );
        }
      }
      return { id: dish.id, name: dish.name, price: dish.price ?? 0, score, reasons };
    })
    .filter((d) => d.score > 0)
    .sort((a, b) => b.score - a.score);
}

export async function createSupply(body) {
  return request('/api/supplies', { method: 'POST', body: JSON.stringify(body) });
}

export async function createOrder(body) {
  return request('/api/orders', { method: 'POST', body: JSON.stringify(body) });
}

export async function createOrderBatch(items) {
  try {
    const order = await request('/api/orders', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
    return { ok: true, orders: [order] };
  } catch (err) {
    if (err.status === 409 && err.body) {
      return {
        ok: false,
        error: err.body.error ?? 'Не хватает ингредиентов',
        missing: err.body.shortages ?? err.body.missing ?? [],
      };
    }
    throw err;
  }
}

export async function getSupplies() {
  const batches = await getBatches();
  const map = new Map();

  for (const b of batches) {
    if (!b.supplyId) continue;
    if (!map.has(b.supplyId)) {
      map.set(b.supplyId, {
        id: b.supplyId,
        number: b.supplyNumber ?? '—',
        createdAt: b.suppliedAt,
        batchesCount: 0,
        totalQuantity: 0,
      });
    }
    const supply = map.get(b.supplyId);
    supply.batchesCount += 1;
    supply.totalQuantity += b.quantity;
  }

  return [...map.values()]
    .filter((s) => s.number && s.number !== 'string')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function getOrders() {
  return [];
}


export async function seedIfEmpty() {
  if (seedPromise) return seedPromise;

  seedPromise = (async () => {
    let hasProducts = false;
    try {
      const stock = await request('/api/stock');
      if (Array.isArray(stock) && stock.length > 0) {
        hasProducts = true;
        console.log(`[SEED] Продуктов уже: ${stock.length}`);
      }
    } catch (err) {
      console.warn('[SEED] Не удалось проверить сток:', err.message);
    }

    if (!hasProducts) {
      console.log('[SEED] Продуктов нет — создаю стартовую поставку');
      try {
        await createSupply({
          id: crypto.randomUUID(),
          number: `SUP-SEED-${Date.now()}`,
          items: SEED_SUPPLY.items,
        });
        console.log('[SEED] Поставка создана');
      } catch (err) {
        console.warn('[SEED] Ошибка поставки:', err.message);
      }
    }

    let existingDishes = [];
    try {
      existingDishes = await request('/api/dishes');
    } catch (err) {
      console.warn('[SEED] Не удалось проверить блюда:', err.message);
    }

    const existingNames = new Set((existingDishes ?? []).map((d) => d.name));

    for (const dish of SEED_DISHES) {
      if (existingNames.has(dish.name)) {
        console.log(`[SEED] "${dish.name}" уже есть — пропускаю`);
        continue;
      }
      try {
        const res = await request('/api/dishes', {
          method: 'POST',
          body: JSON.stringify({
            name: dish.name,
            recipeItems: dish.composition.map((c) => ({
              productId: c.productId,
              quantity: c.quantity,
            })),
          }),
        });
        console.log(`[SEED] Создано: ${dish.name} → ${res.id}`);
      } catch (err) {
        console.warn(`[SEED] Ошибка "${dish.name}":`, err.message);
      }
    }
  })();

  return seedPromise;
}