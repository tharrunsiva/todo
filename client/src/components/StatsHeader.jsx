import React from 'react';

const StatsHeader = ({ stats, onClearCompleted, onOpenAddModal }) => {
  const completionRate = stats?.completionRate || 0;
  const total = stats?.total || 0;
  const completed = stats?.completed || 0;
  const active = stats?.active || 0;
  const urgent = stats?.urgent || 0;

  return (
    <div className="mb-4 animate-fade-in">
      {/* Top Banner Row */}
      <div className="glass-card p-4 mb-3 position-relative overflow-hidden">
        <div className="row align-items-center g-3">
          <div className="col-lg-7">
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge badge-category">Productivity Hub</span>
              {urgent > 0 && (
                <span className="badge badge-urgent d-inline-flex align-items-center gap-1">
                  <i className="bi bi-exclamation-triangle-fill"></i> {urgent} Urgent Action{urgent > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <h2 className="text-white fw-bold mb-1">
              Command Center
            </h2>
            <p className="text-muted small mb-3">
              Manage your tasks, track real-time delivery milestones, and optimize daily throughput.
            </p>

            {/* Progress bar */}
            <div>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="small text-secondary fw-semibold">Workspace Progress</span>
                <span className="small text-white fw-bold">{completionRate}% Completed</span>
              </div>
              <div className="progress progress-dark" style={{ height: '9px' }}>
                <div
                  className="progress-bar progress-bar-glow"
                  role="progressbar"
                  style={{ width: `${completionRate}%` }}
                  aria-valuenow={completionRate}
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
            </div>
          </div>

          <div className="col-lg-5 d-flex flex-column align-items-lg-end gap-2">
            <div className="d-flex gap-2 w-100 justify-content-lg-end">
              <button
                onClick={onOpenAddModal}
                className="btn btn-accent px-3 py-2 flex-grow-1 flex-lg-grow-0"
              >
                <i className="bi bi-plus-circle me-1"></i> Add New Task
              </button>

              {completed > 0 && (
                <button
                  onClick={onClearCompleted}
                  className="btn btn-dark-outline px-3 py-2 text-danger flex-grow-1 flex-lg-grow-0"
                  title="Remove all completed tasks"
                >
                  <i className="bi bi-trash3 me-1"></i> Clear Done
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4 Metrics Cards */}
      <div className="row g-3">
        {/* Total */}
        <div className="col-6 col-md-3">
          <div className="stat-widget d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
              }}
            >
              <i className="bi bi-layers-fill fs-5"></i>
            </div>
            <div>
              <div className="text-muted small fw-medium" style={{ fontSize: '0.78rem' }}>Total Tasks</div>
              <div className="fs-4 fw-bold text-white lh-1 mt-1">{total}</div>
            </div>
          </div>
        </div>

        {/* Active Pending */}
        <div className="col-6 col-md-3">
          <div className="stat-widget d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(6, 182, 212, 0.12)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                color: '#22d3ee',
              }}
            >
              <i className="bi bi-clock-history fs-5"></i>
            </div>
            <div>
              <div className="text-muted small fw-medium" style={{ fontSize: '0.78rem' }}>In Progress</div>
              <div className="fs-4 fw-bold text-cyan lh-1 mt-1">{active}</div>
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="col-6 col-md-3">
          <div className="stat-widget d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#34d399',
              }}
            >
              <i className="bi bi-check-circle-fill fs-5"></i>
            </div>
            <div>
              <div className="text-muted small fw-medium" style={{ fontSize: '0.78rem' }}>Completed</div>
              <div className="fs-4 fw-bold text-success lh-1 mt-1">{completed}</div>
            </div>
          </div>
        </div>

        {/* Priority Urgent */}
        <div className="col-6 col-md-3">
          <div className="stat-widget d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(244, 63, 94, 0.12)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: '#fb7185',
              }}
            >
              <i className="bi bi-lightning-charge-fill fs-5"></i>
            </div>
            <div>
              <div className="text-muted small fw-medium" style={{ fontSize: '0.78rem' }}>Urgent</div>
              <div className="fs-4 fw-bold text-danger lh-1 mt-1">{urgent}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsHeader;
