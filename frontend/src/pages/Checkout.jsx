import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import api from "../api/axios";

export default function Checkout() {
  const { user } = useAuth();
  const { cart, loading, refreshCart } = useCart();
  const navigate = useNavigate();
  const savedAddress = user?.addresses?.[0] || {};

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const [address, setAddress] = useState({
    line1: savedAddress.line1 || "",
    line2: savedAddress.line2 || "",
    city: savedAddress.city || "",
    state: savedAddress.state || "",
    pincode: savedAddress.pincode || "",
    country: savedAddress.country || "India",
    phone: savedAddress.phone || "",
  });
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);

  const items = cart.items || [];
  const validItems = items.filter((i) => i.product && typeof i.product === "object");
  const total = validItems.reduce((sum, i) => sum + (i.product.price || 0) * i.quantity, 0);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError("");
    setPlacing(true);
    try {
      const { data } = await api.post("/orders", { shippingAddress: address, paymentMethod });
      await refreshCart();
      navigate(`/orders/${data.order._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not place order");
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <h1>Checkout</h1>
        <div className="page-loading">Loading checkout...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>Checkout</h1>
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handlePlaceOrder}>
          <h2>Shipping Address</h2>
          {error && <div className="form-error">{error}</div>}
          <label>
            Address line 1
            <input required value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} />
          </label>
          <label>
            Address line 2
            <input value={address.line2} onChange={(e) => setAddress({ ...address, line2: e.target.value })} />
          </label>
          <div className="row-3">
            <label>
              City
              <input required value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
            </label>
            <label>
              State
              <input required value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} />
            </label>
            <label>
              Pincode
              <input
                required
                value={address.pincode}
                onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
              />
            </label>
          </div>
          <label>
            Phone
            <input required value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} />
          </label>

          <h2>Payment Method</h2>
          <div className="payment-options">
            {["COD", "CARD", "UPI"].map((method) => (
              <label key={method} className="radio-option">
                <input
                  type="radio"
                  name="payment"
                  value={method}
                  checked={paymentMethod === method}
                  onChange={() => setPaymentMethod(method)}
                />
                {method === "COD" ? "Cash on Delivery" : method}
              </label>
            ))}
          </div>

          <button className="btn-primary" type="submit" disabled={placing || validItems.length === 0}>
            {placing ? "Placing order..." : "Place Order"}
          </button>
        </form>

        <div className="cart-summary">
          <h2>Order Summary</h2>
          {validItems.map((i) => (
            <div className="summary-row" key={`${i.product._id}-${i.size}`}>
              <span>
                {i.product.name} (Size {i.size}) x{i.quantity}
              </span>
              <span>₹{i.product.price * i.quantity}</span>
            </div>
          ))}
          <div className="summary-row">
            <span>Shipping</span>
            <span>{total >= 999 ? "Free" : "₹49"}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>₹{total >= 999 ? total : total + 49}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
