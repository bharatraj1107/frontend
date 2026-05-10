import { useEffect, useState, useCallback } from "react";

const COMPANY_NAMES = {
  bharath: "Bharath Enterprises",
  shree_ganaapathy: "Shree Ganaapathy Roto Prints",
  vel: "Vel Gravure"
};

function Profile() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const canViewStaff = ["admin", "ceo"].includes(role);

  const [activeTab, setActiveTab] = useState("myprofile");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  // Staff directory state
  const [staff, setStaff] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const headers = {
    "Content-Type": "application/json",
    Authorization: token
  };

  // Fetch own profile
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/profile", {
        headers: { Authorization: token }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setEditForm({
          phone: data.phone || "",
          dob: data.dob || "",
          age: data.age || "",
          address: data.address || "",
          emergencyContact: data.emergencyContact || "",
          joiningDate: data.joiningDate || ""
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch staff directory
  const fetchStaff = useCallback(async () => {
    if (!canViewStaff) return;
    setStaffLoading(true);
    try {
      const res = await fetch("http://localhost:5001/staff", {
        headers: { Authorization: token }
      });
      if (res.ok) {
        const data = await res.json();
        setStaff(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStaffLoading(false);
    }
  }, [canViewStaff, token]);

  useEffect(() => {
    fetchProfile();
    fetchStaff();
  }, [fetchProfile, fetchStaff]);

  // Save profile
  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("http://localhost:5001/profile", {
        method: "PUT",
        headers,
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data.user);
        setEditing(false);
        alert("✅ Profile updated!");
      } else {
        alert("❌ " + (data.error || "Failed to save"));
      }
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadge = (r) => {
    switch (r) {
      case "ceo": return "sp-badge sp-badge-danger";
      case "admin": return "sp-badge sp-badge-primary";
      case "manager": return "sp-badge sp-badge-warning";
      default: return "sp-badge sp-badge-success";
    }
  };

  const getRoleIcon = (r) => {
    switch (r) {
      case "ceo": return "👔";
      case "admin": return "🛡️";
      case "manager": return "📋";
      default: return "👷";
    }
  };

  // Filter staff
  const filteredStaff = staff.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Profile card component (reused for own and staff view)
  const ProfileCard = ({ user, isOwn }) => (
    <div className="sp-card animate-fade">
      {/* Header */}
      <div className="flex items-center gap-4 mb-5" style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "var(--space-5)" }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "2rem", color: "#fff", fontWeight: 800, flexShrink: 0
        }}>
          {user.name?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: "var(--font-2xl)" }}>{user.name}</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className={getRoleBadge(user.role)}>{getRoleIcon(user.role)} {user.role?.toUpperCase()}</span>
            <span className="sp-badge sp-badge-neutral">{COMPANY_NAMES[user.company] || user.company}</span>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
        <InfoRow icon="📧" label="Email" value={user.email} />
        <InfoRow icon="📱" label="Phone" value={user.phone} />
        <InfoRow icon="🎂" label="Date of Birth" value={user.dob ? formatDate(user.dob) : "—"} />
        <InfoRow icon="📅" label="Age" value={user.age || "—"} />
        <InfoRow icon="🏢" label="Joining Date" value={user.joiningDate ? formatDate(user.joiningDate) : "—"} />
        <InfoRow icon="🆔" label="ID Proof" value={user.idProofType ? `${user.idProofType.toUpperCase()}: ${user.idProofNumber || "—"}` : "—"} />
        <InfoRow icon="🏠" label="Address" value={user.address} full />
        <InfoRow icon="🚨" label="Emergency Contact" value={user.emergencyContact} />
      </div>

      {isOwn && !editing && (
        <button className="sp-btn sp-btn-primary sp-btn-lg mt-5" onClick={() => setEditing(true)}>
          ✏️ Edit Profile
        </button>
      )}
    </div>
  );

  const InfoRow = ({ icon, label, value, full }) => (
    <div style={full ? { gridColumn: "1 / -1" } : {}}>
      <p className="text-xs text-muted" style={{ margin: 0, marginBottom: 2 }}>{icon} {label}</p>
      <p style={{ margin: 0, fontWeight: 600, fontSize: "var(--font-base)" }}>{value || "—"}</p>
    </div>
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    } catch { return dateStr; }
  };

  return (
    <div>
      <div className="page-header">
        <h1>👤 Profile</h1>
        <p>View and manage your profile information</p>
      </div>

      {/* Tabs */}
      <div className="sp-tabs">
        <button
          className={`sp-tab${activeTab === "myprofile" ? " active" : ""}`}
          onClick={() => { setActiveTab("myprofile"); setSelectedStaff(null); }}
        >
          👤 My Profile
        </button>
        {canViewStaff && (
          <button
            className={`sp-tab${activeTab === "staff" ? " active" : ""}`}
            onClick={() => setActiveTab("staff")}
          >
            👥 Staff Directory
          </button>
        )}
      </div>

      {/* ===== MY PROFILE TAB ===== */}
      {activeTab === "myprofile" && (
        <div className="animate-fade">
          {loading ? (
            <p className="text-muted animate-pulse">Loading profile...</p>
          ) : profile ? (
            <>
              <ProfileCard user={profile} isOwn={true} />

              {/* Edit Form */}
              {editing && (
                <form onSubmit={saveProfile} className="sp-card mt-4 animate-fade">
                  <h3 className="mb-4">✏️ Edit Your Details</h3>
                  <div className="sp-form-row">
                    <div className="sp-form-group">
                      <label className="sp-label">Phone</label>
                      <input className="sp-input" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} placeholder="Phone number" />
                    </div>
                    <div className="sp-form-group">
                      <label className="sp-label">Date of Birth</label>
                      <input type="date" className="sp-input" value={editForm.dob} onChange={e => setEditForm({ ...editForm, dob: e.target.value })} />
                    </div>
                    <div className="sp-form-group">
                      <label className="sp-label">Age</label>
                      <input className="sp-input" value={editForm.age} onChange={e => setEditForm({ ...editForm, age: e.target.value })} placeholder="Age" />
                    </div>
                    <div className="sp-form-group">
                      <label className="sp-label">Joining Date</label>
                      <input type="date" className="sp-input" value={editForm.joiningDate} onChange={e => setEditForm({ ...editForm, joiningDate: e.target.value })} />
                    </div>
                    <div className="sp-form-group">
                      <label className="sp-label">Address</label>
                      <input className="sp-input" value={editForm.address} onChange={e => setEditForm({ ...editForm, address: e.target.value })} placeholder="Full address" />
                    </div>
                    <div className="sp-form-group">
                      <label className="sp-label">Emergency Contact</label>
                      <input className="sp-input" value={editForm.emergencyContact} onChange={e => setEditForm({ ...editForm, emergencyContact: e.target.value })} placeholder="Emergency phone" />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button type="submit" className="sp-btn sp-btn-success sp-btn-lg" disabled={saving}>
                      {saving ? "⏳ Saving..." : "✅ Save Changes"}
                    </button>
                    <button type="button" className="sp-btn sp-btn-secondary sp-btn-lg" onClick={() => setEditing(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </>
          ) : (
            <div className="sp-alert sp-alert-error">Failed to load profile</div>
          )}
        </div>
      )}

      {/* ===== STAFF DIRECTORY TAB ===== */}
      {activeTab === "staff" && canViewStaff && (
        <div className="animate-fade">
          {/* Selected staff detail view */}
          {selectedStaff ? (
            <div>
              <button className="sp-btn sp-btn-secondary mb-4" onClick={() => setSelectedStaff(null)}>
                ← Back to Directory
              </button>
              <ProfileCard user={selectedStaff} isOwn={false} />
            </div>
          ) : (
            <>
              {/* Search */}
              <div className="sp-card mb-4">
                <input
                  className="sp-input"
                  placeholder="🔍 Search by name, email, or role..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              {staffLoading ? (
                <p className="text-muted animate-pulse">Loading staff...</p>
              ) : (
                <div className="sp-table-wrap">
                  <table className="sp-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Joining Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStaff.length === 0 ? (
                        <tr><td className="empty-cell" colSpan="6">No staff found</td></tr>
                      ) : (
                        filteredStaff.map(s => (
                          <tr key={s._id}>
                            <td>
                              <div className="flex items-center gap-2">
                                <span style={{
                                  width: 32, height: 32, borderRadius: "50%",
                                  background: "linear-gradient(135deg, var(--color-primary-light), var(--color-accent))",
                                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                                  color: "#fff", fontWeight: 700, fontSize: "var(--font-sm)", flexShrink: 0
                                }}>
                                  {s.name?.charAt(0)?.toUpperCase()}
                                </span>
                                <strong>{s.name}</strong>
                              </div>
                            </td>
                            <td><span className={getRoleBadge(s.role)}>{s.role?.toUpperCase()}</span></td>
                            <td>{s.email}</td>
                            <td>{s.phone || "—"}</td>
                            <td>{s.joiningDate ? new Date(s.joiningDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</td>
                            <td>
                              <button className="sp-btn sp-btn-primary sp-btn-sm" onClick={() => setSelectedStaff(s)}>
                                View Profile
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default Profile;
