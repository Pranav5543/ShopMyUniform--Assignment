import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const { cart, loading, updateItem, removeItem, refreshCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const items = cart.items || [];
  const total = items.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);

  if (loading) {
    return (
      <div className="page-container">
        <h1>Your Cart</h1>
        <div className="page-loading">Loading cart...</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="page-container">
        <h1>Your Cart</h1>
        <p className="empty-state">
          Your cart is empty. <Link to="/products">Browse products</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>Your Cart</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {items.map((item) => {
            const prod = item.product;
            if (!prod || typeof prod !== "object") return null;
            return (
              <div key={`${prod._id}-${item.size}`} className="cart-item">
                <div className="cart-item-img">
                  {prod.images?.[0] && (
                    <img src={prod.images[0]} alt={prod.name} style={{ width: "80px", height: "80px", objectFit: "contain", borderRadius: "8px", background: "#f8fafc" }} />
                  )}
                </div>
                <div className="cart-item-info">
                  <h3>{prod.name}</h3>
                  <p>Size: {item.size}</p>
                  <p>₹{prod.price} each</p>
                </div>
                <div className="cart-item-controls">
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val <= 0) removeItem(prod._id, item.size);
                      else updateItem(prod._id, item.size, val);
                    }}
                  />
                  <button className="btn-link" onClick={() => removeItem(prod._id, item.size)}>
                    Remove
                  </button>
                </div>
                <div className="cart-item-subtotal">₹{prod.price * item.quantity}</div>
              </div>
            );
          })}
        </div>
        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Items total</span>
            <span>₹{total}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{total >= 999 ? "Free" : "₹49"}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>₹{total >= 999 ? total : total + 49}</span>
          </div>
          <button className="btn-primary" onClick={() => navigate("/checkout")}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
