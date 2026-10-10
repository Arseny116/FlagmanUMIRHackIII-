import { createContext, useState } from 'react';

export const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const add = (dish) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.dishId === dish.id);
      if (existing) {
        return prev.map((i) =>
          i.dishId === dish.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { dishId: dish.id, name: dish.name, price: dish.price, quantity: 1 }];
    });
  };

  const remove = (dishId) =>
    setItems((prev) => prev.filter((i) => i.dishId !== dishId));

  const setQuantity = (dishId, quantity) =>
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.dishId !== dishId)
        : prev.map((i) => (i.dishId === dishId ? { ...i, quantity } : i))
    );

  const clear = () => setItems([]);

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, add, remove, setQuantity, clear, total, count }}>
      {children}
    </CartContext.Provider>
  );
}