import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function Schools() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/schools")
      .then(({ data }) => setSchools(data.schools))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Loading schools...</div>;

  return (
    <div className="page-container">
      <div className="schools-header">
        <h1>Select Your School</h1>
        <p className="schools-subtitle">
          Choose your school to browse official uniforms, sportswear, and dress code items.
        </p>
      </div>
      <div className="school-grid">
        {schools.map((s) => (
          <Link key={s._id} to={`/products?school=${s._id}`} className="school-card">
            <div className="school-card-image">
              <img
                src={s.imageUrl || s.logoUrl || `/assets/${s.name}.png`}
                alt={s.name}
              />
              <span className="school-city-badge">{s.city}</span>
            </div>
            <div className="school-card-body">
              <h3>{s.name}</h3>
              <p className="school-grades">Grades: {s.grades?.[0]} - {s.grades?.[s.grades.length - 1]}</p>
              <span className="school-card-cta">Browse Uniforms →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
