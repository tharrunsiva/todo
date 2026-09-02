import React, { useState, useEffect } from 'react';

const categories = ['Work', 'Personal', 'Study', 'Finance', 'Health', 'General'];
const priorities = [
  { value: 'urgent', label: '🔥 Urgent' },
  { value: 'high', label: '⚡ High' },
  { value: 'medium', label: '🔷 Medium' },
  { value: 'low', label: '🌱 Low' },
];

const TodoModal = ({ show, onClose, onSave, editingTodo }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('Work');
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingTodo) {
      setTitle(editingTodo.title || '');
      setDescription(editingTodo.description || '');
      setPriority(editingTodo.priority || 'medium');
      setCategory(editingTodo.category || 'Work');
      setDueDate(editingTodo.dueDate ? editingTodo.dueDate.split('T')[0] : '');
      setTags(editingTodo.tags ? editingTodo.tags.join(', ') : '');
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setCategory('Work');
      setDueDate('');
      setTags('');
    }
    setError('');
  }, [editingTodo, show]);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSave({
        title,
        description,
        priority,
        category,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)' }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content dark-modal">
          {/* Header */}
          <div className="modal-header border-bottom border-secondary border-opacity-25 pb-3">
            <div className="d-flex align-items-center gap-2">
              <div
                className="d-flex align-items-center justify-content-center"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(99, 102, 241, 0.2)',
                  color: '#818cf8',
                }}
              >
                <i className={`bi ${editingTodo ? 'bi-pencil-square' : 'bi-plus-square'}`}></i>
              </div>
              <h5 className="modal-title fw-bold text-white mb-0">
                {editingTodo ? 'Edit Task' : 'Create New Task'}
              </h5>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit}>
            <div className="modal-body py-3">
              {error && (
                <div className="alert alert-danger py-2 px-3 small border-0 d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-exclamation-octagon-fill"></i>
                  <span>{error}</span>
                </div>
              )}

              {/* Title */}
              <div className="mb-3">
                <label className="form-label small text-secondary fw-semibold">
                  Title <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Deploy Kubernetes cluster configuration"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              {/* Description */}
              <div className="mb-3">
                <label className="form-label small text-secondary fw-semibold">
                  Description / Notes
                </label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Add details, criteria, or subtasks..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>

              {/* Priority & Category Grid */}
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small text-secondary fw-semibold">
                    Priority
                  </label>
                  <select
                    className="form-select"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    {priorities.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-6">
                  <label className="form-label small text-secondary fw-semibold">
                    Category
                  </label>
                  <select
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Due Date & Tags */}
              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label small text-secondary fw-semibold">
                    Due Date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>

                <div className="col-6">
                  <label className="form-label small text-secondary fw-semibold">
                    Tags <span className="text-muted fw-normal">(comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="devops, k8s, sprint"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer border-top border-secondary border-opacity-25 pt-3">
              <button
                type="button"
                className="btn btn-dark-outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-accent px-4" disabled={loading}>
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-1"></span>
                ) : (
                  <i className="bi bi-check2 me-1"></i>
                )}
                {editingTodo ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TodoModal;
