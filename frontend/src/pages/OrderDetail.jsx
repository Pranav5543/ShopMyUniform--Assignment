import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import "./OrderDetail.css";

const STATUS_STEPS = ["Placed", "Processing", "Shipped", "Out for Delivery", "Delivered"];
const STATUS_COLORS = {
  Placed: "#6366f1",
  Processing: "#2563eb",
  Shipped: "#7c3aed",
  "Out for Delivery": "#d97706",
  Delivered: "#16a34a",
  Cancelled: "#dc2626",
  "Return Requested": "#dc2626",
  Returned: "#6b7280",
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const loadOrder = () => {
    api
      .get(`/orders/${id}`)
      .then(({ data }) => setOrder(data.order))
      .finally(() => setLoading(false));
  };

  useEffect(loadOrder, [id]);

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(true);
    try {
      await api.put(`/orders/${id}/cancel`);
      loadOrder();
    } finally {
      setCancelling(false);
    }
  };

  if (loading)
    return (
      <div className="od-page">
        <div className="od-loading">
          <div className="od-loading-spinner"></div>
          <span>Loading order details...</span>
        </div>
      </div>
    );

  if (!order)
    return (
      <div className="od-page">
        <div className="od-empty">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5"><path d="M21 8v13H3V8"/><path d="M23 3H1v5h22V3z"/><path d="M10 12h4"/></svg>
          <h2>Order Not Found</h2>
          <p>We couldn't locate this order. It may have been removed.</p>
          <Link to="/orders" className="od-back-btn">← Back to My Orders</Link>
        </div>
      </div>
    );

  const isCancelled = order.status === "Cancelled";
  const isReturned = ["Returned", "Return Requested"].includes(order.status);
  const canCancel = !["Delivered", "Cancelled", "Returned"].includes(order.status);

  // Progress stepper
  const currentStepIdx = isCancelled || isReturned ? -1 : STATUS_STEPS.indexOf(order.status);

  return (
    <div className="od-page">
      {/* Breadcrumb */}
      <div className="od-breadcrumb">
        <Link to="/">Home</Link>
        <span className="od-bc-sep">›</span>
        <Link to="/orders">My Orders</Link>
        <span className="od-bc-sep">›</span>
        <span className="od-bc-current">{order.orderNumber}</span>
      </div>

      {/* Top Status Banner */}
      <div className={`od-status-banner ${isCancelled ? "cancelled" : isReturned ? "returned" : ""}`}>
        <div className="od-status-banner-left">
          <div className="od-status-icon-wrap" style={{ background: STATUS_COLORS[order.status] || "#6366f1" }}>
            {isCancelled ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            ) : order.status === "Delivered" ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            )}
          </div>
          <div>
            <h1 className="od-status-title">
              {isCancelled ? "Order Cancelled" : isReturned ? "Return " + order.status.split(" ").pop() : `Order ${order.status}`}
            </h1>
            <p className="od-status-subtitle">
              {order.status === "Delivered"
                ? `Delivered on ${new Date(order.statusHistory[order.statusHistory.length - 1]?.at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`
                : order.estimatedDeliveryDate
                ? `Estimated delivery by ${new Date(order.estimatedDeliveryDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`
                : `Placed on ${new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`
              }
            </p>
          </div>
        </div>
        <div className="od-order-id-box">
          <span className="od-order-id-label">Order ID</span>
          <span className="od-order-id-value">{order.orderNumber}</span>
        </div>
      </div>

      {/* Progress Stepper (only for non-cancelled/returned orders) */}
      {!isCancelled && !isReturned && (
        <div className="od-stepper-card">
          <div className="od-stepper">
            {STATUS_STEPS.map((step, idx) => {
              const isCompleted = idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              return (
                <div key={step} className={`od-step ${isCompleted ? "completed" : ""} ${isCurrent ? "current" : ""}`}>
                  <div className="od-step-dot">
                    {isCompleted ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : (
                      <span className="od-step-num">{idx + 1}</span>
                    )}
                  </div>
                  {idx < STATUS_STEPS.length - 1 && (
                    <div className={`od-step-line ${idx < currentStepIdx ? "filled" : ""}`}></div>
                  )}
                  <span className="od-step-label">{step}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="od-content-grid">
        {/* Left Column */}
        <div className="od-left-col">
          {/* Items Card */}
          <div className="od-card">
            <div className="od-card-header">
              <h2>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                Items Ordered
              </h2>
              <span className="od-item-count">{order.items.length} item{order.items.length > 1 ? "s" : ""}</span>
            </div>
            <div className="od-items-list">
              {order.items.map((item, idx) => (
                <div key={idx} className="od-item-row">
                  <div className="od-item-thumb">
                    {item.image || (item.product && item.product.images && item.product.images[0]) ? (
                      <img src={item.image || item.product.images[0]} alt={item.name} />
                    ) : (
                      <div className="od-item-thumb-placeholder">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                      </div>
                    )}
                  </div>
                  <div className="od-item-info">
                    <h4 className="od-item-name">{item.name}</h4>
                    <div className="od-item-meta">
                      <span className="od-item-meta-chip">Size: {item.size}</span>
                      <span className="od-item-meta-chip">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <div className="od-item-price">
                    <span className="od-item-price-total">₹{item.price * item.quantity}</span>
                    {item.quantity > 1 && <span className="od-item-price-unit">₹{item.price} each</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Card */}
          <div className="od-card">
            <div className="od-card-header">
              <h2>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Order Timeline
              </h2>
            </div>
            <div className="od-timeline">
              {order.statusHistory.map((h, idx) => (
                <div key={idx} className={`od-timeline-item ${idx === order.statusHistory.length - 1 ? "latest" : ""}`}>
                  <div className="od-timeline-dot-wrap">
                    <div className={`od-timeline-dot ${idx === order.statusHistory.length - 1 ? "active" : ""}`} style={{ borderColor: STATUS_COLORS[h.status] || "#6366f1" }}>
                      {idx === order.statusHistory.length - 1 && (
                        <div className="od-timeline-dot-inner" style={{ background: STATUS_COLORS[h.status] || "#6366f1" }}></div>
                      )}
                    </div>
                    {idx < order.statusHistory.length - 1 && <div className="od-timeline-line"></div>}
                  </div>
                  <div className="od-timeline-content">
                    <div className="od-timeline-status">{h.status}</div>
                    <div className="od-timeline-date">
                      {new Date(h.at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} at{" "}
                      {new Date(h.at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    {h.note && <div className="od-timeline-note">{h.note}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="od-right-col">
          {/* Shipping Address */}
          <div className="od-card">
            <div className="od-card-header">
              <h2>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Delivery Address
              </h2>
            </div>
            <div className="od-address-body">
              <p className="od-address-line">{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && <p className="od-address-line">{order.shippingAddress.line2}</p>}
              <p className="od-address-line">
                {order.shippingAddress.city}, {order.shippingAddress.state}
              </p>
              <p className="od-address-pincode">PIN: {order.shippingAddress.pincode}</p>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="od-card od-price-card">
            <div className="od-card-header">
              <h2>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                Price Details
              </h2>
            </div>
            <div className="od-price-rows">
              <div className="od-price-row">
                <span>Items Total ({order.items.length} item{order.items.length > 1 ? "s" : ""})</span>
                <span>₹{order.itemsTotal}</span>
              </div>
              <div className="od-price-row">
                <span>Shipping Fee</span>
                <span className={order.shippingFee === 0 ? "od-free" : ""}>
                  {order.shippingFee === 0 ? "FREE" : `₹${order.shippingFee}`}
                </span>
              </div>
              <div className="od-price-divider"></div>
              <div className="od-price-row od-price-total">
                <span>Total Amount</span>
                <span>₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          {canCancel && (
            <div className="od-card od-actions-card">
              <button className="od-cancel-btn" onClick={handleCancel} disabled={cancelling}>
                {cancelling ? (
                  <>
                    <span className="od-btn-spinner"></span>
                    Cancelling...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                    Cancel Order
                  </>
                )}
              </button>
              <p className="od-cancel-note">You can cancel this order before it's shipped.</p>
            </div>
          )}

          {/* Need Help */}
          <div className="od-card od-help-card">
            <h3>Need Help?</h3>
            <p>Have questions about your order? Our AI assistant can help with tracking, returns, and more.</p>
            <button className="od-help-btn" onClick={() => {
              const chatFab = document.querySelector('.chat-fab');
              if (chatFab) chatFab.click();
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              Chat with Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
