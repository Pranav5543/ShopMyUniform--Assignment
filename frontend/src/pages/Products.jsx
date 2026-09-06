import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";

const CATEGORIES = ["shirt", "pant", "skirt", "tie", "shoes", "sports-kit"];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  const school = searchParams.get("school") || "";
  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    api.get("/schools").then(({ data }) => setSchools(data.schools));
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = {};
    if (school) params.school = school;
    if (category) params.category = category;
    if (search) params.search = search;
    const { data } = await api.get("/products", { params });
    setProducts(data.products);
    setLoading(false);
  }, [school, category, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam("search", searchInput);
  };

  return (
    <div className="page-container">
      <h1>Product Catalog</h1>

      <div className="filters-bar">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <input
            placeholder="Search shirts, pants, ties..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        <select value={school} onChange={(e) => updateParam("school", e.target.value)}>
          <option value="">All schools</option>
          {schools.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>

        <select value={category} onChange={(e) => updateParam("category", e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="page-loading">Loading products...</div>
      ) : products.length === 0 ? (
        <p className="empty-state">No products matched your filters. Try broadening your search.</p>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
