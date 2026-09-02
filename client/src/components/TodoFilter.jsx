import React from 'react';

const categories = ['All', 'Work', 'Personal', 'Study', 'Finance', 'Health', 'General'];
const priorities = [
  { label: 'All Priorities', value: '' },
  { label: '🔥 Urgent', value: 'urgent' },
  { label: '⚡ High', value: 'high' },
  { label: '🔷 Medium', value: 'medium' },
  { label: '🌱 Low', value: 'low' },
];

const TodoFilter = ({
  search,
  setSearch,
  status,
  setStatus,
  category,
  setCategory,
  priority,
  setPriority,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  onReset,
}) => {
  return (
    <div className="glass-card p-3 mb-4 animate-fade-in">
      <div className="row g-2 align-items-center">
        {/* Search Bar */}
        <div className="col-12 col-md-4">
          <div className="input-group">
            <span
              className="input-group-text border-0"
              style={{
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-muted)',
                borderTopLeftRadius: 'var(--radius-sm)',
                borderBottomLeftRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                borderRight: 'none',
              }}
            >
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by title, tag, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                borderLeft: 'none',
              }}
            />
            {search && (
              <button
                className="btn btn-dark-outline border-start-0"
                onClick={() => setSearch('')}
                type="button"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            )}
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="col-12 col-md-4 d-flex justify-content-start justify-content-md-center">
          <div
            className="btn-group p-1 w-100"
            role="group"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <button
              type="button"
              className={`btn btn-sm py-1 fw-semibold ${
                status === 'all' ? 'btn-accent' : 'text-secondary'
              }`}
              onClick={() => setStatus('all')}
              style={{ borderRadius: '6px' }}
            >
              All
            </button>
            <button
              type="button"
              className={`btn btn-sm py-1 fw-semibold ${
                status === 'active' ? 'btn-accent' : 'text-secondary'
              }`}
              onClick={() => setStatus('active')}
              style={{ borderRadius: '6px' }}
            >
              In Progress
            </button>
            <button
              type="button"
              className={`btn btn-sm py-1 fw-semibold ${
                status === 'completed' ? 'btn-accent' : 'text-secondary'
              }`}
              onClick={() => setStatus('completed')}
              style={{ borderRadius: '6px' }}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Category, Priority & Sort Dropdowns */}
        <div className="col-12 col-md-4 d-flex gap-2 justify-content-md-end">
          {/* Priority */}
          <select
            className="form-select form-select-sm"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            style={{ maxWidth: '130px' }}
          >
            {priorities.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          {/* Category */}
          <select
            className="form-select form-select-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ maxWidth: '120px' }}
          >
            {categories.map((c) => (
              <option key={c} value={c === 'All' ? '' : c}>
                {c === 'All' ? 'All Tags' : c}
              </option>
            ))}
          </select>

          {/* Sort Order Toggle */}
          <button
            className="btn btn-icon btn-dark-outline"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            title={`Order: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
          >
            <i className={`bi ${sortOrder === 'asc' ? 'bi-sort-up' : 'bi-sort-down'}`}></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TodoFilter;
