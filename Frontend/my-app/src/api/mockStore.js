import { PRODUCTS, DISHES, INITIAL_BATCHES, INITIAL_SUPPLIES } from './mockData';

const store = {
  batches:  INITIAL_BATCHES.map((b) => ({ ...b })),
  supplies: INITIAL_SUPPLIES.map((s) => ({ ...s })),
  orders:   [],
  nextIds:  { batch: 100, supply: 100, order: 100 },
};

const HOUR = 36e5;
const hoursLeft = (expiresAt) => (new Date(expiresAt) - new Date()) / HOUR;
const isExpired = (b) => hoursLeft(b.expiresAt) <= 0;
const productById = (id) => PRODUCTS.find((p) => p.id === id);

export function getStock() {
  return PRODUCTS.map((p) => {
    const liveBatches = store.batches.filter((b) => b.productId === p.id && !isExpired(b));
    return {
      id: p.id,
      name: p.name,
      unit: p.unit,
      totalQuantity: liveBatches.reduce((s, b) => s + b.quantity, 0),
      batchesCount: liveBatches.length,
    };
  });
}

export function getBatches(productId) {
  return store.batches
    .filter((b) => (productId ? b.productId === productId : true) && !isExpired(b))
    .map((b) => {
      const hours = Math.max(0, Math.floor(hoursLeft(b.expiresAt)));
      return {
        ...b,
        productName: productById(b.productId)?.name,
        unit: productById(b.productId)?.unit,
        hoursLeft: hours,
        status: hours < 24 ? 'critical' : hours < 48 ? 'warning' : 'ok',
      };
    })
    .sort((a, b) => a.hoursLeft - b.hoursLeft);
}

export function getExpiring(hours = 24) {
  return getBatches().filter((b) => b.hoursLeft <= hours);
}

export function getStopList() {
  return DISHES.map((dish) => {
    const missing = [];
    for (const need of dish.composition) {
      const have = getStock().find((s) => s.id === need.productId)?.totalQuantity ?? 0;
      if (have < need.quantity) {
        missing.push({
          productId: need.productId,
          productName: productById(need.productId)?.name,
          need: need.quantity,
          have,
          unit: productById(need.productId)?.unit,
        });
      }
    }
    return { id: dish.id, name: dish.name, missing };
  }).filter((d) => d.missing.length > 0);
}

export function getHotOffers() {
  return DISHES.map((dish) => {
    let score = 0;
    const reasons = [];
    for (const need of dish.composition) {
      const soonest = getBatches(need.productId).sort((a, b) => a.hoursLeft - b.hoursLeft)[0];
      if (soonest && soonest.hoursLeft < 48) {
        score += ((48 - soonest.hoursLeft) / 48) * need.quantity;
        reasons.push(
          `${soonest.productName}: ${soonest.quantity} ${soonest.unit}, истекает через ${soonest.hoursLeft} ч`
        );
      }
    }
    return { id: dish.id, name: dish.name, price: dish.price, score, reasons };
  })
  .filter((d) => d.score > 0)
  .sort((a, b) => b.score - a.score);
}

export function getOrders() { return store.orders; }
export function getSupplies() { return store.supplies; }


export function createSupply({ number, createdAt, items }) {
  const supplyId = store.nextIds.supply++;
  const ts = createdAt || new Date().toISOString();
  store.supplies.push({ id: supplyId, number: number || `SUP-${supplyId}`, createdAt: ts });

  for (const it of items) {
    const expiresAt = new Date(new Date(ts).getTime() + it.shelfLifeHours * HOUR).toISOString();
    store.batches.push({
      id: store.nextIds.batch++,
      productId: it.productId,
      quantity: it.quantity,
      suppliedAt: ts,
      expiresAt,
      supplyId,
    });
  }
  return { id: supplyId, number };
}

export function createOrder({ dishId, quantity = 1 }) {
  const dish = DISHES.find((d) => d.id === dishId);
  if (!dish) return { ok: false, error: 'Блюдо не найдено' };

  const missing = [];
  for (const need of dish.composition) {
    const have = getStock().find((s) => s.id === need.productId)?.totalQuantity ?? 0;
    const required = need.quantity * quantity;
    if (have < required) {
      missing.push({
        productName: productById(need.productId)?.name,
        need: required,
        have,
        unit: productById(need.productId)?.unit,
      });
    }
  }
  if (missing.length) return { ok: false, error: 'Не хватает ингредиентов', missing };

  for (const need of dish.composition) {
    let toWriteOff = need.quantity * quantity;
    const batches = getBatches(need.productId).sort((a, b) => a.hoursLeft - b.hoursLeft);
    for (const b of batches) {
      if (toWriteOff <= 0) break;
      const take = Math.min(b.quantity, toWriteOff);
      const real = store.batches.find((x) => x.id === b.id);
      real.quantity -= take;
      toWriteOff -= take;
    }
  }

  const order = {
    id: store.nextIds.order++,
    dishId,
    dishName: dish.name,
    quantity,
    createdAt: new Date().toISOString(),
  };
  store.orders.push(order);
  return { ok: true, order };
}

function checkAvailability(items) {
  const needs = {}; 

  for (const { dishId, quantity } of items) {
    const dish = DISHES.find((d) => d.id === dishId);
    if (!dish) return { ok: false, error: `Блюдо #${dishId} не найдено`, missing: [] };

    for (const need of dish.composition) {
      const key = need.productId;
      const product = productById(key);

      if (!needs[key]) {
        needs[key] = {
          productId: key,
          productName: product?.name ?? `Продукт #${key}`,
          unit: product?.unit ?? '',
          need: 0,
        };
      }
      needs[key].need += need.quantity * quantity;
    }
  }

  const missing = [];
  for (const key of Object.keys(needs)) {
    const { need, ...rest } = needs[key];
    const have = getStock().find((s) => s.id === Number(key))?.totalQuantity ?? 0;
    if (have < need) {
      missing.push({ ...rest, need: Number(need.toFixed(3)), have: Number(have.toFixed(3)) });
    }
  }

  return { ok: missing.length === 0, missing };
}

export function createOrderBatch(items) {
  const check = checkAvailability(items);
  if (!check.ok) {
    return { ok: false, error: check.error ?? 'Не хватает ингредиентов', missing: check.missing };
  }

  const created = [];
  for (const { dishId, quantity } of items) {
    const dish = DISHES.find((d) => d.id === dishId);

    for (const need of dish.composition) {
      let toWriteOff = need.quantity * quantity;
      const batches = getBatches(need.productId).sort((a, b) => a.hoursLeft - b.hoursLeft);
      for (const b of batches) {
        if (toWriteOff <= 0) break;
        const take = Math.min(b.quantity, toWriteOff);
        const real = store.batches.find((x) => x.id === b.id);
        if (real) real.quantity -= take;
        toWriteOff -= take;
      }
    }

    const order = {
      id: store.nextIds.order++,
      dishId,
      dishName: dish.name,
      quantity,
      createdAt: new Date().toISOString(),
    };
    store.orders.push(order);
    created.push(order);
  }

  return { ok: true, orders: created };
}