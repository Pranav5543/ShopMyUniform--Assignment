import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const [navSearch, setNavSearch] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/products?search=${encodeURIComponent(navSearch.trim())}`);
      setNavSearch("");
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-icon">🎓</span>
          Shop<span>My</span>Uniform
        </Link>
        <nav className="nav-links">
          <Link to="/schools">Schools</Link>
          <Link to="/products">Uniforms</Link>
          {user && <Link to="/orders">My Orders</Link>}
        </nav>

        <form onSubmit={handleSearchSubmit} className="nav-search-form">
          <span className="nav-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search for your school or product..."
            value={navSearch}
            onChange={(e) => setNavSearch(e.target.value)}
          />
        </form>

        <div className="nav-actions">
          <Link to="/wishlist" className="cart-link" title="Wishlist">
            ❤️ {wishlist.length > 0 && <span className="badge">{wishlist.length}</span>}
          </Link>
          <Link to="/cart" className="cart-link" title="Shopping Cart">
            🛒 {itemCount > 0 && <span className="badge">{itemCount}</span>}
          </Link>
          {user ? (
            <div className="nav-user">
              <Link to="/profile" className="nav-user-name">
                Hi, {user.name.split(" ")[0]} ▾
              </Link>
              <button className="btn-link logout-link" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="nav-login-link">Login</Link>
              <Link to="/register" className="btn-primary-small">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
