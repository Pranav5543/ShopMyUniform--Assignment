import { createContext, useContext, useState, useCallback, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart({ items: [] });
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get("/cart");
      setCart(data.cart);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId, size, quantity = 1) => {
    const { data } = await api.post("/cart", { productId, size, quantity });
    setCart(data.cart);
  };

  const updateItem = async (productId, size, quantity) => {
    const { data } = await api.put("/cart", { productId, size, quantity });
    setCart(data.cart);
  };

  const removeItem = async (productId, size) => {
    const { data } = await api.delete("/cart", { data: { productId, size } });
    setCart(data.cart);
  };

  const clearCart = async () => {
    const { data } = await api.delete("/cart/clear");
    setCart(data.cart);
  };

  const itemCount = cart.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{ cart, loading, refreshCart, addToCart, updateItem, removeItem, clearCart, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
