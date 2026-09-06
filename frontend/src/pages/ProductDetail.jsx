import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart, refreshCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Gallery & Interactive States
  const [activeThumb, setActiveThumb] = useState(0);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showZoom, setShowZoom] = useState(false);
  const [showAddressInput, setShowAddressInput] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState({
    line1: "123 School Lane",
    line2: "",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560001"
  });
  const [tempAddress, setTempAddress] = useState(deliveryAddress);
  const [openAccordions, setOpenAccordions] = useState({ details: true, delivery: false });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then(({ data }) => {
        setProduct(data.product);
        // Pre-select first available size or default
        if (data.product?.sizes?.length > 0) {
          const available = data.product.sizes.find((s) => s.stock > 0) || data.product.sizes[0];
          setSelectedSize(available.size);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-loading">Loading product details...</div>;
  if (!product) return <p className="empty-state">Product not found.</p>;

  const selectedStock = product.sizes.find((s) => s.size === selectedSize)?.stock ?? 0;
  const originalPrice = Math.round(product.price * 1.12);
  const discountPercent = Math.round(((originalPrice - product.price) / originalPrice) * 100);

  // Generate 5 gallery views from available image(s) for the professional thumbnail strip
  const baseImg = product.images?.[0] || "/assets/placeholder.png";
  const galleryViews = [
    { label: "Full View", src: baseImg, style: { objectPosition: "center" } },
    { label: "Waist & Label", src: baseImg, style: { objectPosition: "top center", transform: "scale(1.4)" } },
    { label: "Fabric & Seam", src: baseImg, style: { objectPosition: "center right", transform: "scale(1.6)" } },
    { label: "Back & Hem", src: baseImg, style: { objectPosition: "bottom center", transform: "scale(1.3)" } },
    { label: "Material Texture", src: baseImg, style: { objectPosition: "center", transform: "scale(2.0)" } },
  ];

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!selectedSize) {
      setMessage("Please select a size first.");
      return;
    }
    try {
      await addToCart(product._id, selectedSize, quantity);
      await refreshCart();
      setMessage("Added to cart successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not add to cart.");
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!selectedSize) {
      setMessage("Please select a size first.");
      return;
    }
    try {
      await addToCart(product._id, selectedSize, quantity);
      await refreshCart();
      navigate("/checkout");
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not proceed to checkout.");
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (tempAddress.pincode.trim().length >= 6) {
      setDeliveryAddress(tempAddress);
      setShowAddressInput(false);
    } else {
      setMessage("Please enter a valid pincode.");
    }
  };

  const toggleAccordion = (section) => {
    setOpenAccordions((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="pd-page-wrapper">
      {/* Top Breadcrumb Bar */}
      <div className="pd-top-bar">
        <nav className="pd-breadcrumbs">
          <Link to="/">Home</Link>
          <span className="pd-bc-sep">&rsaquo;</span>
          <Link to="/products">School Uniforms</Link>
          <span className="pd-bc-sep">&rsaquo;</span>
          <Link to={`/schools`}>{product.school?.name || "School"}</Link>
          <span className="pd-bc-sep">&rsaquo;</span>
          <span className="pd-bc-current">{product.name}</span>
        </nav>

        <div className="pd-top-actions">
          <button
            className={`pd-action-btn ${isWishlisted(product._id) ? "active" : ""}`}
            onClick={() => toggleWishlist(product)}
            title="Add to Wishlist"
          >
            <span className="pd-action-icon">{isWishlisted(product._id) ? "❤️" : "🤍"}</span>
            <span>Wishlist</span>
          </button>
          <button className="pd-action-btn" onClick={handleShare} title="Share Product">
            <span className="pd-action-icon">↗</span>
            <span>{copied ? "Copied!" : "Share"}</span>
          </button>
        </div>
      </div>

      {/* Main Product Layout */}
      <div className="pd-container">
        {/* Left: Gallery Column */}
        <div className="pd-gallery-col">
          {/* Vertical Thumbnail Strip */}
          <div className="pd-thumbnails">
            {galleryViews.map((item, idx) => (
              <button
                key={idx}
                className={`pd-thumb-btn ${activeThumb === idx ? "active" : ""}`}
                onClick={() => setActiveThumb(idx)}
                type="button"
              >
                <div className="pd-thumb-crop">
                  <img src={item.src} alt={item.label} style={item.style} />
                </div>
              </button>
            ))}
          </div>

          {/* Main Showcase Image */}
          <div className="pd-main-img-card" onClick={() => setShowZoom(true)}>
            <div className="pd-main-img-view">
              <img
                src={galleryViews[activeThumb].src}
                alt={product.name}
                style={galleryViews[activeThumb].style}
              />
            </div>
            <button className="pd-zoom-trigger" title="Zoom image" type="button">
              🔍
            </button>
          </div>
        </div>

        {/* Right: Product Info & Actions Column */}
        <div className="pd-info-col">
          <h1 className="pd-title">{product.name}</h1>
          <p className="pd-school-link">{product.school?.name}</p>

          {/* Ratings & Social Proof */}
          <div className="pd-social-proof">
            <div className="pd-rating-badge">
              <span className="pd-star">★</span> <strong>4.8</strong>
              <span className="pd-rating-count">(124 reviews)</span>
            </div>
            <span className="pd-divider">|</span>
            <span className="pd-bought-text">1K+ bought in last month</span>
          </div>

          {/* Price & Offer Row */}
          <div className="pd-price-row">
            <span className="pd-price-current">₹{product.price}</span>
            <span className="pd-price-original">₹{originalPrice}</span>
            <span className="pd-discount-badge">{discountPercent}% OFF</span>
          </div>
          <p className="pd-tax-note">Inclusive of all taxes</p>

          {/* Description */}
          <p className="pd-description">{product.description}</p>

          {/* 4 Feature Badges */}
          <div className="pd-badges-grid">
            <div className="pd-badge-item">
              <div className="pd-badge-icon icon-shield">🛡️</div>
              <div className="pd-badge-text">
                <strong>Genuine</strong>
                <span>School Uniform</span>
              </div>
            </div>
            <div className="pd-badge-item">
              <div className="pd-badge-icon icon-leaf">🍃</div>
              <div className="pd-badge-text">
                <strong>Comfortable</strong>
                <span>All-Day Wear</span>
              </div>
            </div>
            <div className="pd-badge-item">
              <div className="pd-badge-icon icon-diamond">💎</div>
              <div className="pd-badge-text">
                <strong>Durable</strong>
                <span>&amp; Long-Lasting</span>
              </div>
            </div>
            <div className="pd-badge-item">
              <div className="pd-badge-icon icon-wash">🧼</div>
              <div className="pd-badge-text">
                <strong>Easy</strong>
                <span>Care Fabric</span>
              </div>
            </div>
          </div>

          {/* Size Selection Section */}
          <div className="pd-size-section">
            <div className="pd-size-header">
              <span className="pd-size-label">Size</span>
              <button
                type="button"
                className="pd-size-guide-btn"
                onClick={() => setShowSizeGuide(true)}
              >
                📐 Size Guide
              </button>
            </div>

            <div className="pd-size-chips">
              {product.sizes.map((s) => {
                const isSelected = selectedSize === s.size;
                const isOut = s.stock === 0;
                return (
                  <button
                    key={s.size}
                    type="button"
                    className={`pd-size-chip ${isSelected ? "selected" : ""} ${isOut ? "disabled" : ""}`}
                    disabled={isOut}
                    onClick={() => {
                      setSelectedSize(s.size);
                      setQuantity(1);
                    }}
                  >
                    {s.size}
                  </button>
                );
              })}
            </div>

            {/* Stock status indicator */}
            <div className="pd-stock-status">
              {selectedStock > 0 ? (
                <span className="pd-in-stock">
                  <span className="pd-stock-dot"></span> In stock ({selectedStock} available)
                </span>
              ) : (
                <span className="pd-out-of-stock">
                  <span className="pd-stock-dot red"></span> Out of stock in size {selectedSize}
                </span>
              )}
            </div>
          </div>

          {/* Action Row: Stepper + Add to Cart + Buy Now (With Generous Gap Above) */}
          <div className="pd-actions-row">
            {/* Quantity Stepper */}
            <div className="pd-qty-stepper">
              <button
                type="button"
                className="pd-qty-btn"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1 || selectedStock === 0}
              >
                &minus;
              </button>
              <span className="pd-qty-value">{quantity}</span>
              <button
                type="button"
                className="pd-qty-btn"
                onClick={() => setQuantity(Math.min(selectedStock, quantity + 1))}
                disabled={quantity >= selectedStock || selectedStock === 0}
              >
                &#43;
              </button>
            </div>

            {/* Add to Cart Button (Top-to-Bottom Hover Animation) */}
            <button
              type="button"
              className="btn-primary pd-btn-add"
              onClick={handleAddToCart}
              disabled={selectedStock === 0}
            >
              <span>🛒</span> Add to Cart
            </button>

            {/* Buy Now Button (Top-to-Bottom Hover Animation) */}
            <button
              type="button"
              className="btn-secondary pd-btn-buy"
              onClick={handleBuyNow}
              disabled={selectedStock === 0}
            >
              Buy Now
            </button>
          </div>

          {/* Feedback notification toast */}
          {message && (
            <div className="pd-toast-message">
              <span>{message.includes("success") ? "✅" : "ℹ️"}</span> {message}
            </div>
          )}

          {/* Delivery & Pincode Card */}
          <div className="pd-delivery-card">
            <div className="pd-delivery-top">
              <span className="pd-delivery-icon">🚚</span>
              <div className="pd-delivery-info">
                <p className="pd-delivery-lead">
                  Delivery to <strong>{deliveryAddress.pincode} ({deliveryAddress.city})</strong>
                </p>
                <p className="pd-address-preview" style={{ fontSize: "0.82rem", color: "#64748b", margin: "-2px 0 4px" }}>
                  {deliveryAddress.line1}{deliveryAddress.line2 ? `, ${deliveryAddress.line2}` : ""}
                </p>
                <p className="pd-delivery-dates">
                  Get it by <strong>Tue, 10 Jun &ndash; Thu, 12 Jun</strong>
                </p>
                <p className="pd-delivery-promo">Free delivery on orders above ₹999</p>
              </div>
              <button
                type="button"
                className="pd-change-pincode-btn"
                onClick={() => setShowAddressInput(!showAddressInput)}
              >
                Change
              </button>
            </div>

            {showAddressInput && (
              <form onSubmit={handleAddressSubmit} className="pd-address-form" style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <input
                  type="text"
                  placeholder="Address Line 1"
                  required
                  value={tempAddress.line1}
                  onChange={(e) => setTempAddress({ ...tempAddress, line1: e.target.value })}
                  style={{ padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                />
                <input
                  type="text"
                  placeholder="Address Line 2 (Optional)"
                  value={tempAddress.line2}
                  onChange={(e) => setTempAddress({ ...tempAddress, line2: e.target.value })}
                  style={{ padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                />
                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    type="text"
                    placeholder="City"
                    required
                    value={tempAddress.city}
                    onChange={(e) => setTempAddress({ ...tempAddress, city: e.target.value })}
                    style={{ flex: 1, padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                  />
                  <input
                    type="text"
                    placeholder="State"
                    required
                    value={tempAddress.state}
                    onChange={(e) => setTempAddress({ ...tempAddress, state: e.target.value })}
                    style={{ flex: 1, padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                  />
                </div>
                <input
                  type="text"
                  placeholder="6-digit Pincode"
                  required
                  maxLength={6}
                  value={tempAddress.pincode}
                  onChange={(e) => setTempAddress({ ...tempAddress, pincode: e.target.value })}
                  style={{ padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: "6px" }}
                />
                <button type="submit" className="btn-primary-small" style={{ alignSelf: "flex-start", marginTop: "4px" }}>
                  Save Address
                </button>
              </form>
            )}
          </div>

          {/* Trust Guarantees */}
          <div className="pd-trust-row">
            <div className="pd-trust-item">
              <span className="pd-trust-icon">🔄</span>
              <div className="pd-trust-texts">
                <strong>Easy Returns</strong>
                <span>Hassle-free, 7 days</span>
              </div>
            </div>
            <div className="pd-trust-item">
              <span className="pd-trust-icon">🛡️</span>
              <div className="pd-trust-texts">
                <strong>100% Authentic</strong>
                <span>School Products</span>
              </div>
            </div>
            <div className="pd-trust-item">
              <span className="pd-trust-icon">💳</span>
              <div className="pd-trust-texts">
                <strong>Secure Payment</strong>
                <span>Multiple options</span>
              </div>
            </div>
          </div>

          {/* Collapsible Accordions */}
          <div className="pd-accordions">
            {/* Product Details Accordion */}
            <div className="pd-accordion-item">
              <button
                type="button"
                className="pd-accordion-header"
                onClick={() => toggleAccordion("details")}
              >
                <span>Product Details</span>
                <span className={`pd-chevron ${openAccordions.details ? "open" : ""}`}>▾</span>
              </button>
              {openAccordions.details && (
                <div className="pd-accordion-body">
                  <div className="pd-specs-grid">
                    <div className="pd-spec-row">
                      <span className="pd-spec-name">Category</span>
                      <span className="pd-spec-val">{product.category}</span>
                    </div>
                    <div className="pd-spec-row">
                      <span className="pd-spec-name">Gender</span>
                      <span className="pd-spec-val">{product.gender}</span>
                    </div>
                    <div className="pd-spec-row">
                      <span className="pd-spec-name">Recommended Grades</span>
                      <span className="pd-spec-val">{product.gradeLevels?.join(", ") || "All"}</span>
                    </div>
                    <div className="pd-spec-row">
                      <span className="pd-spec-name">Fabric Material</span>
                      <span className="pd-spec-val">65% Premium Cotton, 35% Durable Poly-Blend</span>
                    </div>
                    <div className="pd-spec-row">
                      <span className="pd-spec-name">Fit &amp; Stitch</span>
                      <span className="pd-spec-val">Tailored School Fit with Reinforced Double Seams</span>
                    </div>
                    <div className="pd-spec-row">
                      <span className="pd-spec-name">Care Instructions</span>
                      <span className="pd-spec-val">Machine wash warm with like colors. Warm iron if needed.</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Delivery & Returns Accordion */}
            <div className="pd-accordion-item">
              <button
                type="button"
                className="pd-accordion-header"
                onClick={() => toggleAccordion("delivery")}
              >
                <span>Delivery &amp; Returns</span>
                <span className={`pd-chevron ${openAccordions.delivery ? "open" : ""}`}>▾</span>
              </button>
              {openAccordions.delivery && (
                <div className="pd-accordion-body">
                  <ul className="pd-accordion-list">
                    <li>Dispatched within 24-48 business hours with live tracking link.</li>
                    <li>Free doorstep replacement available if the size is too loose or tight.</li>
                    <li>7-day return guarantee with full refund to original payment source.</li>
                    <li>Packaged in tamper-proof, hygienic school delivery boxes.</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="pd-modal-overlay" onClick={() => setShowSizeGuide(false)}>
          <div className="pd-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="pd-modal-header">
              <h3>📐 Official School Uniform Size Guide</h3>
              <button
                type="button"
                className="pd-modal-close"
                onClick={() => setShowSizeGuide(false)}
              >
                &times;
              </button>
            </div>
            <div className="pd-modal-body">
              <p className="pd-size-guide-note">
                All measurements are in inches. For the best comfort, measure over normal inner clothing.
              </p>
              <table className="pd-size-table">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Age / Grade</th>
                    <th>Chest (in)</th>
                    <th>Waist (in)</th>
                    <th>Length (in)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>22</strong></td>
                    <td>Grades 1 &ndash; 2 (6-7 yrs)</td>
                    <td>24&quot;</td>
                    <td>20&quot; - 22&quot;</td>
                    <td>26&quot;</td>
                  </tr>
                  <tr>
                    <td><strong>24</strong></td>
                    <td>Grades 3 &ndash; 4 (8-9 yrs)</td>
                    <td>26&quot;</td>
                    <td>22&quot; - 24&quot;</td>
                    <td>28&quot;</td>
                  </tr>
                  <tr>
                    <td><strong>26</strong></td>
                    <td>Grades 5 &ndash; 6 (10-11 yrs)</td>
                    <td>28&quot;</td>
                    <td>24&quot; - 26&quot;</td>
                    <td>31&quot;</td>
                  </tr>
                  <tr>
                    <td><strong>28</strong></td>
                    <td>Grades 7 &ndash; 8 (12-13 yrs)</td>
                    <td>30&quot;</td>
                    <td>26&quot; - 28&quot;</td>
                    <td>34&quot;</td>
                  </tr>
                  <tr>
                    <td><strong>30</strong></td>
                    <td>Grades 9 &ndash; 10 (14-15 yrs)</td>
                    <td>32&quot;</td>
                    <td>28&quot; - 30&quot;</td>
                    <td>37&quot;</td>
                  </tr>
                  <tr>
                    <td><strong>32</strong></td>
                    <td>Senior (16+ yrs)</td>
                    <td>34&quot;</td>
                    <td>30&quot; - 32&quot;</td>
                    <td>40&quot;</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="pd-modal-footer">
              <button
                type="button"
                className="btn-primary"
                onClick={() => setShowSizeGuide(false)}
              >
                Got It, Thanks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {showZoom && (
        <div className="pd-modal-overlay" onClick={() => setShowZoom(false)}>
          <div className="pd-zoom-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="pd-modal-close zoom-close"
              onClick={() => setShowZoom(false)}
            >
              &times;
            </button>
            <div className="pd-zoom-img-box">
              <img src={galleryViews[activeThumb].src} alt={product.name} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
