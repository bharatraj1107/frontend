import { useEffect, useState } from "react";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company: 'bharath',
    product_name: '',
    foil_type: 'blister',
    size: '',
    required_kg: '',
    worker_name: ''
  });
  const [image, setImage] = useState(null);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const isManager = ['admin', 'manager', 'ceo'].includes(role);
  const isAdminOrCeo = ['admin', 'ceo'].includes(role);

  const companies = [
    { value: 'bharath', label: 'Bharath Enterprises' },
    { value: 'shree_ganaapathy', label: 'Shree Ganaapathy Roto Prints' },
    { value: 'vel', label: 'Vel Gravure' }
  ];

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch("http://localhost:5001/tasks", {
        headers: { Authorization: token }
      });
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      const res = await fetch(`http://localhost:5001/tasks/${taskId}`, {
        method: 'PUT',
        headers: { Authorization: token },
        body: (() => {
          const fd = new FormData();
          if (updates.product_name !== undefined) fd.append('product_name', updates.product_name);
          if (updates.size !== undefined) fd.append('size', updates.size);
          if (updates.required_kg !== undefined) fd.append('required_kg', updates.required_kg);
          return fd;
        })()
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.details || data?.message || 'Update failed');
      fetchTasks();
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      const res = await fetch(`http://localhost:5001/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: token }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.details || data?.message || 'Delete failed');
      fetchTasks();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.product_name || !formData.size || !formData.required_kg || !formData.worker_name) {
      alert("Please fill all required fields (including Worker name)");
      return;
    }
    setLoading(true);
    const data = new FormData();
    data.append('company', formData.company);
    data.append('product_name', formData.product_name);
    data.append('size', formData.size);
    data.append('required_kg', formData.required_kg);
    data.append('foil_type', formData.foil_type);
    if (formData.worker_name) data.append('worker_name', formData.worker_name);
    if (image) data.append('image', image);

    try {
      const res = await fetch("http://localhost:5001/tasks-create", {
        method: 'POST',
        headers: { Authorization: token },
        body: data
      });
      if (res.ok) {
        alert("✅ Task created!");
        setFormData({ company: 'bharath', product_name: '', size: '', required_kg: '', foil_type: 'blister', worker_name: '' });
        setImage(null);
        fetchTasks();
        setShowForm(false);
      } else {
        let errText = "";
        try { errText = await res.text(); } catch (e) { /* ignore */ }
        alert(`Error creating task: ${errText || res.status}`);
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'completed') return 'sp-badge sp-badge-success';
    if (status === 'in-progress') return 'sp-badge sp-badge-primary';
    return 'sp-badge sp-badge-warning';
  };

  return (
    <div>
      <div className="page-header">
        <h1>📋 Tasks</h1>
      </div>

      {isManager && (
        <div className="mb-5">
          <button
            onClick={() => setShowForm(!showForm)}
            className={`sp-btn ${showForm ? 'sp-btn-secondary' : 'sp-btn-success'}`}
          >
            {showForm ? "✖ Hide Form" : "➕ Create New Task"}
          </button>
        </div>
      )}

      {showForm && isManager && (
        <form onSubmit={handleSubmit} className="sp-card mb-5 animate-fade" encType="multipart/form-data">
          <h3 className="mb-4">New Task</h3>

          <div className="sp-form-group">
            <label className="sp-label">Company *</label>
            <select
              value={formData.company}
              onChange={(e) => setFormData({...formData, company: e.target.value})}
              className="sp-select"
            >
              {companies.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="sp-form-group">
            <label className="sp-label">Product Name *</label>
            <input
              required
              placeholder="e.g., Aspirin Blister Pack"
              value={formData.product_name}
              onChange={(e) => setFormData({...formData, product_name: e.target.value})}
              className="sp-input"
            />
          </div>

          <div className="sp-form-group">
            <label className="sp-label">Foil Type *</label>
            <select
              value={formData.foil_type}
              onChange={(e) => setFormData({ ...formData, foil_type: e.target.value })}
              className="sp-select"
            >
              <option value="blister">Blister</option>
              <option value="alualu">Alu-Alu</option>
              <option value="wrapper">Wrapper</option>
              <option value="pouch">Pouch</option>
              <option value="laminated">Laminated</option>
              <option value="roll">Roll</option>
            </select>
          </div>

          <div className="sp-form-row">
            <div className="sp-form-group">
              <label className="sp-label">Size *</label>
              <input
                required placeholder="e.g., 10x5 cm"
                value={formData.size}
                onChange={(e) => setFormData({...formData, size: e.target.value})}
                className="sp-input"
              />
            </div>
            <div className="sp-form-group">
              <label className="sp-label">Required KG *</label>
              <input
                required type="number" placeholder="e.g., 25"
                value={formData.required_kg}
                onChange={(e) => setFormData({...formData, required_kg: e.target.value})}
                className="sp-input"
              />
            </div>
          </div>

          <div className="sp-form-group">
            <label className="sp-label">Worker Name *</label>
            <select
              required
              value={formData.worker_name}
              onChange={(e) => setFormData({ ...formData, worker_name: e.target.value })}
              className="sp-select"
            >
              <option value="" disabled>Select worker</option>
              <option value={`Worker (${formData.company === 'shree_ganaapathy' ? 'shree' : formData.company})`}>
                Worker ({formData.company === 'shree_ganaapathy' ? 'shree' : formData.company})
              </option>
            </select>
          </div>

          <div className="sp-form-group">
            <label className="sp-label">Sample Image</label>
            <input
              type="file" accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="sp-input"
            />
          </div>

          <button type="submit" disabled={loading} className="sp-btn sp-btn-success sp-btn-lg sp-btn-block">
            {loading ? "⏳ Creating..." : "✅ Create Task"}
          </button>
        </form>
      )}

      <div>
        <h2 className="mb-4">Task List ({tasks.length})</h2>
        {tasks.length === 0 ? (
          <p className="text-muted">{isManager ? "No tasks yet. Create one above!" : "No tasks. Check with manager."}</p>
        ) : (
          tasks.map(task => (
            <div key={task._id} className="sp-card mb-4 animate-fade">
              <div className="flex items-center justify-between mb-3">
                <h3>{task.product_name || 'Stock Task'}</h3>
                <span className={getStatusBadge(task.status)}>{task.status}</span>
              </div>

              {task.image_path && (
                <img
                  src={`http://localhost:5001/${task.image_path}`}
                  alt="sample"
                  style={{ maxWidth: "150px", borderRadius: "8px", marginBottom: "12px" }}
                />
              )}

              <div className="flex flex-wrap gap-4 text-sm mb-3">
                <p><strong>Company:</strong> {task.company}</p>
                <p><strong>Size:</strong> {task.size}</p>
                <p><strong>Required:</strong> {task.required_kg} KG</p>
                {task.worker_name && <p><strong>Worker:</strong> {task.worker_name}</p>}
              </div>

              <div className="flex gap-2 flex-wrap mt-3">
                {isAdminOrCeo && (
                  <>
                    <button
                      type="button"
                      className="sp-btn sp-btn-warning sp-btn-sm"
                      onClick={() => {
                        const next = prompt('Update product name', task.product_name || '');
                        if (next === null) return;
                        updateTask(task._id, { product_name: next });
                      }}
                    >Edit</button>
                    <button
                      type="button"
                      className="sp-btn sp-btn-danger sp-btn-sm"
                      onClick={() => deleteTask(task._id)}
                    >Delete</button>
                  </>
                )}
                <button
                  type="button"
                  className="sp-btn sp-btn-primary sp-btn-sm"
                  onClick={async () => {
                    try {
                      const resp = await fetch(`http://localhost:5001/tasks/${task._id}/start`, {
                        method: "POST",
                        headers: { Authorization: token }
                      });
                      const data = await resp.json().catch(() => ({}));
                      if (!resp.ok) throw new Error(data?.message || data?.error || "Failed to start task");
                      alert(data?.message || "Task started");
                      fetchTasks();
                    } catch (e) { alert(e.message); }
                  }}
                >Start</button>
                <button
                  type="button"
                  className="sp-btn sp-btn-success sp-btn-sm"
                  onClick={async () => {
                    const usedKg = prompt("Enter Used KG:");
                    if (usedKg === null) return;
                    const wasteKg = prompt("Enter Waste KG:");
                    if (wasteKg === null) return;
                    const remainingKg = prompt("Enter Remaining KG:");
                    if (remainingKg === null) return;
                    if (!usedKg || !wasteKg || !remainingKg) return alert("All fields are required!");
                    try {
                      const formData = new FormData();
                      formData.append("used_kg", usedKg);
                      formData.append("waste_kg", wasteKg);
                      formData.append("remaining_kg", remainingKg);
                      const resp = await fetch(`http://localhost:5001/tasks/${task._id}/consume`, {
                        method: "POST",
                        headers: { Authorization: token },
                        body: formData
                      });
                      const data = await resp.json().catch(() => ({}));
                      if (!resp.ok) throw new Error(data?.message || data?.error || "Failed to complete task");
                      alert("Task completed successfully!");
                      fetchTasks();
                    } catch (e) { alert(e.message); }
                  }}
                >Complete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Tasks;
