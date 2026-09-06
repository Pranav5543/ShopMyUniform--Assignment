import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const STATUS_COLORS = {
  Placed: "#6b7280",
  Processing: "#2563eb",
  Shipped: "#7c3aed",
  "Out for Delivery": "#d97706",
  Delivered: "#16a34a",
  Cancelled: "#dc2626",
  "Return Requested": "#dc2626",
  Returned: "#6b7280",
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/orders")
      .then(({ data }) => setOrders(data.orders))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Loading orders...</div>;

  if (orders.length === 0) {
    return (
      <div className="page-container">
        <h1>My Orders</h1>
        <p className="empty-state">
          You haven't placed any orders yet. <Link to="/products">Start shopping</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>My Orders</h1>
      <div className="orders-list">
        {orders.map((o) => (
          <Link to={`/orders/${o._id}`} key={o._id} className="order-row">
            <div>
              <strong>{o.orderNumber}</strong>
              <p>{new Date(o.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="order-row-items">{o.items.length} item(s)</div>
            <div className="order-row-total">₹{o.totalAmount}</div>
            <div className="order-status-pill" style={{ backgroundColor: STATUS_COLORS[o.status] || "#6b7280" }}>
              {o.status}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
