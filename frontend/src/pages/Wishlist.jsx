import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import ProductCard from "../components/ProductCard";

export default function Wishlist() {
  const { wishlist } = useWishlist();

  if (wishlist.length === 0) {
    return (
      <div className="page-container">
        <h1>Your Wishlist</h1>
        <p className="empty-state">
          Your wishlist is empty. <Link to="/products">Browse products</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>Your Wishlist</h1>
      <div className="category-cards-grid">
        {wishlist.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}
