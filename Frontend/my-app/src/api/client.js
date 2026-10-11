import * as store from './mockStore';

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));
const wrap = (fn) => async (...args) => { await delay(); return fn(...args); };

export const api = {
  getStock:          wrap(() => store.getStock()),
  getBatches:        wrap((productId) => store.getBatches(productId)),
  getExpiring:       wrap((hours = 24) => store.getExpiring(hours)),
  getStopList:       wrap(() => store.getStopList()),
  getHotOffers:      wrap(() => store.getHotOffers()),
  getOrders:         wrap(() => store.getOrders()),
  getSupplies:       wrap(() => store.getSupplies()),
  createSupply:      wrap((body) => store.createSupply(body)),
  createOrder:       wrap((body) => store.createOrder(body)),
  getExpiringAlerts: wrap((hours = 24) => store.getExpiring(hours)),
  createOrderBatch: wrap((items) => store.createOrderBatch(items)),
};