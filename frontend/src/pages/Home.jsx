import { Link } from "react-router-dom";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="home-page">
      {/* Hero Banner Section matching reference image */}
      <section className="home-hero-wrapper">
        <div className="home-hero">
          <div className="home-hero-content">
            <div className="hero-eyebrow">
              <span>SCHOOL UNIFORMS MADE SIMPLE</span>
            </div>
            <h1>
              School Uniforms,<br />
              <span className="hero-title-highlight">Sorted.</span>
            </h1>
            <p className="hero-description">
              Shop verified uniforms for your child&apos;s school &mdash; shirts, trousers, ties, sports kits, and shoes &mdash;
              all in one place. Have a question? Our AI assistant in the corner can check real stock, sizes,
              delivery times, and your orders instantly.
            </p>
            <div className="home-hero-actions">
              <Link to="/schools" className="btn-hero-primary">
                Find your school &rarr;
              </Link>
              <Link to="/products" className="btn-hero-secondary">
                Browse catalog
              </Link>
            </div>
            <div className="hero-trust-row">
              <div className="trust-item">
                <span className="trust-icon">🚚</span>
                <div className="trust-text">
                  <strong>Fast Delivery</strong>
                  <span>Get it on time, every time.</span>
                </div>
              </div>
              <div className="trust-item">
                <span className="trust-icon">🛡️</span>
                <div className="trust-text">
                  <strong>Genuine Products</strong>
                  <span>100% authentic &amp; trusted.</span>
                </div>
              </div>
              <div className="trust-item">
                <span className="trust-icon">🔄</span>
                <div className="trust-text">
                  <strong>Easy Returns</strong>
                  <span>Hassle-free, 7 days.</span>
                </div>
              </div>
            </div>
          </div>
          <div className="home-hero-visual">
            <img
              src="/assets/banner side image.png"
              alt="School students in neat uniforms smiling with school bags"
              className="hero-banner-img"
            />
          </div>
        </div>
      </section>

      {/* Second Section: Explore Uniforms By Category */}
      <section className="home-explore-section">
        <div className="home-section-container">
          <div className="section-header-row">
            <div>
              <span className="section-eyebrow">EXPLORE UNIFORMS</span>
              <h2 className="section-title">Everything They Need for School</h2>
              <p className="section-subtitle">
                Shop complete school uniforms and essentials, organized by school and category.
              </p>
            </div>
            <Link to="/products" className="view-all-link">
              View all categories &rarr;
            </Link>
          </div>

          <div className="category-cards-grid">
            <Link to="/products?category=shirt" className="category-pill-card">
              <div className="category-pill-img-wrap">
                <img src="/assets/Green Valley White Half-Sleeve Shirt.png" alt="Shirts" />
              </div>
              <div className="category-pill-footer">
                <h4>Shirts</h4>
                <span className="category-circle-arrow">&rarr;</span>
              </div>
            </Link>

            <Link to="/products?category=pant" className="category-pill-card">
              <div className="category-pill-img-wrap">
                <img src="/assets/Sunrise International Grey Trousers.png" alt="Trousers & Skirts" />
              </div>
              <div className="category-pill-footer">
                <h4>Trousers &amp; Skirts</h4>
                <span className="category-circle-arrow">&rarr;</span>
              </div>
            </Link>

            <Link to="/products?category=sports-kit" className="category-pill-card">
              <div className="category-pill-img-wrap">
                <img src="/assets/Sunrise International Sports Kit.png" alt="Sports Kits" />
              </div>
              <div className="category-pill-footer">
                <h4>Sports Kits</h4>
                <span className="category-circle-arrow">&rarr;</span>
              </div>
            </Link>

            <Link to="/products?category=tie" className="category-pill-card">
              <div className="category-pill-img-wrap">
                <img src="/assets/Green Valley House Tie.png" alt="Ties & Accessories" />
              </div>
              <div className="category-pill-footer">
                <h4>Ties &amp; Accessories</h4>
                <span className="category-circle-arrow">&rarr;</span>
              </div>
            </Link>

            <Link to="/products?category=shoes" className="category-pill-card">
              <div className="category-pill-img-wrap">
                <img src="/assets/St.Xavier's Black Formal Shoes.png" alt="Shoes & Socks" />
              </div>
              <div className="category-pill-footer">
                <h4>Shoes &amp; Socks</h4>
                <span className="category-circle-arrow">&rarr;</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Third Section: Partner Schools Showcase */}
      <section className="home-schools-section">
        <div className="home-section-container">
          <div className="section-header-row">
            <div>
              <span className="section-eyebrow">PARTNER SCHOOLS</span>
              <h2 className="section-title">Official Uniforms for Leading Schools</h2>
              <p className="section-subtitle">
                Approved grade-specific uniforms and accessories tailored to each institution&apos;s dress code.
              </p>
            </div>
            <Link to="/schools" className="view-all-link">
              View all schools &rarr;
            </Link>
          </div>

          <div className="home-schools-grid">
            <Link to="/products" className="home-school-card">
              <div className="home-school-img-box">
                <img src="/assets/Green Valley High School.png" alt="Green Valley High School" />
                <span className="home-school-city-tag">Hyderabad</span>
              </div>
              <div className="home-school-body">
                <h3>Green Valley High School</h3>
                <p>Grades 1 &ndash; 10 &bull; Shirts, Pinafores, Trousers &amp; Ties</p>
                <span className="home-school-view">Browse Uniforms &rarr;</span>
              </div>
            </Link>

            <Link to="/products" className="home-school-card">
              <div className="home-school-img-box">
                <img src="/assets/St. Xavier's Public School.png" alt="St. Xavier's Public School" />
                <span className="home-school-city-tag">Mumbai</span>
              </div>
              <div className="home-school-body">
                <h3>St. Xavier&apos;s Public School</h3>
                <p>Grades 1 &ndash; 10 &bull; White Shirts &amp; Formal Shoes</p>
                <span className="home-school-view">Browse Uniforms &rarr;</span>
              </div>
            </Link>

            <Link to="/products" className="home-school-card">
              <div className="home-school-img-box">
                <img src="/assets/Sunrise International School.png" alt="Sunrise International School" />
                <span className="home-school-city-tag">Bengaluru</span>
              </div>
              <div className="home-school-body">
                <h3>Sunrise International School</h3>
                <p>Grades 1 &ndash; 10 &bull; Sky Blue Shirts, Trousers &amp; PE Kits</p>
                <span className="home-school-view">Browse Uniforms &rarr;</span>
              </div>
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
