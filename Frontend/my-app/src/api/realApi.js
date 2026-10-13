async function request(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let message = `HTTP ${res.status}`;
    try {
      const json = JSON.parse(text);
      message = json.error || json.title || message;
      if (json.details) message += `: ${JSON.stringify(json.details)}`;
    } catch { /* not json */ }
    throw new Error(message);
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
  const raw = await request('/api/dishes');
  return raw.map(adaptDish);
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
    getDishes(),
    getBatches(),
    getStopList(),
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
  return request('/api/supplies', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function createOrder(body) {
  return request('/api/orders', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function createOrderBatch(items) {
  return request('/api/orders', {
    method: 'POST',
    body: JSON.stringify({ items }),
  });
}

export async function getSupplies() { return []; }
export async function getOrders() { return []; }