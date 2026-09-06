import { createContext, useContext, useState, useEffect } from "react";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("wishlist");
      if (saved) setWishlist(JSON.parse(saved));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveWishlist = (newList) => {
    setWishlist(newList);
    localStorage.setItem("wishlist", JSON.stringify(newList));
  };

  const addToWishlist = (product) => {
    if (!wishlist.find((p) => p._id === product._id)) {
      saveWishlist([...wishlist, product]);
    }
  };

  const removeFromWishlist = (productId) => {
    saveWishlist(wishlist.filter((p) => p._id !== productId));
  };

  const toggleWishlist = (product) => {
    if (wishlist.find((p) => p._id === product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  const isWishlisted = (productId) => {
    return !!wishlist.find((p) => p._id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{ wishlist, addToWishlist, removeFromWishlist, toggleWishlist, isWishlisted }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
