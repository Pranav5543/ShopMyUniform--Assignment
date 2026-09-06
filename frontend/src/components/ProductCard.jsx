import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  const totalStock = product.sizes?.reduce((sum, s) => sum + s.stock, 0) || 0;
  return (
    <Link to={`/products/${product._id}`} className="product-card">
      <div className="product-card-image">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} />
        ) : (
          <div className="product-card-placeholder">{product.category}</div>
        )}
      </div>
      <div className="product-card-body">
        <h3>{product.name}</h3>
        <p className="product-card-school">{product.school?.name}</p>
        <p className="product-card-price">₹{product.price}</p>
        <p className={`product-card-stock ${totalStock === 0 ? "out" : ""}`}>
          {totalStock === 0 ? "Out of stock" : `${totalStock} units available`}
        </p>
      </div>
    </Link>
  );
}
