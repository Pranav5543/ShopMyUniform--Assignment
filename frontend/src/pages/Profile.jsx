import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [schools, setSchools] = useState([]);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [children, setChildren] = useState(user?.children || []);
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/schools").then(({ data }) => setSchools(data.schools));
  }, []);

  const addChild = () => setChildren([...children, { name: "", grade: "", school: "" }]);
  const updateChild = (idx, field, value) => {
    const copy = [...children];
    copy[idx] = { ...copy[idx], [field]: value };
    setChildren(copy);
  };
  const removeChild = (idx) => setChildren(children.filter((_, i) => i !== idx));

  const addAddress = () =>
    setAddresses([...addresses, { label: "Home", line1: "", line2: "", city: "", state: "", pincode: "", phone: "" }]);
  const updateAddress = (idx, field, value) => {
    const copy = [...addresses];
    copy[idx] = { ...copy[idx], [field]: value };
    setAddresses(copy);
  };
  const removeAddress = (idx) => setAddresses(addresses.filter((_, i) => i !== idx));

  const handleSave = async (e) => {
    e.preventDefault();
    await updateProfile({ name, phone, children, addresses });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="page-container">
      <h1>My Profile</h1>
      <form className="profile-form" onSubmit={handleSave}>
        <section>
          <h2>Account details</h2>
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            Email
            <input value={user?.email} disabled />
          </label>
          <label>
            Phone
            <input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
        </section>

        <section>
          <h2>Student / Child profiles</h2>
          {children.map((c, idx) => (
            <div className="repeatable-row" key={idx}>
              <input
                placeholder="Student name"
                value={c.name || ""}
                onChange={(e) => updateChild(idx, "name", e.target.value)}
              />
              <input
                placeholder="Grade"
                value={c.grade || ""}
                onChange={(e) => updateChild(idx, "grade", e.target.value)}
              />
              <select value={c.school || ""} onChange={(e) => updateChild(idx, "school", e.target.value)}>
                <option value="">Select school</option>
                {schools.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <button type="button" className="btn-link" onClick={() => removeChild(idx)}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" className="btn-secondary" onClick={addChild}>
            + Add student
          </button>
        </section>

        <section>
          <h2>Saved addresses</h2>
          {addresses.map((a, idx) => (
            <div className="address-block" key={idx}>
              <input
                placeholder="Label (Home/Work)"
                value={a.label || ""}
                onChange={(e) => updateAddress(idx, "label", e.target.value)}
              />
              <input
                placeholder="Address line 1"
                value={a.line1 || ""}
                onChange={(e) => updateAddress(idx, "line1", e.target.value)}
              />
              <input
                placeholder="Address line 2"
                value={a.line2 || ""}
                onChange={(e) => updateAddress(idx, "line2", e.target.value)}
              />
              <div className="row-3">
                <input
                  placeholder="City"
                  value={a.city || ""}
                  onChange={(e) => updateAddress(idx, "city", e.target.value)}
                />
                <input
                  placeholder="State"
                  value={a.state || ""}
                  onChange={(e) => updateAddress(idx, "state", e.target.value)}
                />
                <input
                  placeholder="Pincode"
                  value={a.pincode || ""}
                  onChange={(e) => updateAddress(idx, "pincode", e.target.value)}
                />
              </div>
              <input
                placeholder="Phone"
                value={a.phone || ""}
                onChange={(e) => updateAddress(idx, "phone", e.target.value)}
              />
              <button type="button" className="btn-link" onClick={() => removeAddress(idx)}>
                Remove address
              </button>
            </div>
          ))}
          <button type="button" className="btn-secondary" onClick={addAddress}>
            + Add address
          </button>
        </section>

        <button className="btn-primary" type="submit">
          Save changes
        </button>
        {saved && <p className="save-confirm">Profile updated!</p>}
      </form>
    </div>
  );
}
