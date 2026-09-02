import React, { useState } from 'react';
import confetti from 'canvas-confetti';

const priorityConfig = {
  urgent: { label: 'Urgent', class: 'badge-urgent', icon: 'bi-lightning-fill' },
  high: { label: 'High', class: 'badge-high', icon: 'bi-fire' },
  medium: { label: 'Medium', class: 'badge-medium', icon: 'bi-dash-circle' },
  low: { label: 'Low', class: 'badge-low', icon: 'bi-arrow-down-circle' },
};

const TodoItem = ({ todo, onToggle, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const priorityMeta = priorityConfig[todo.priority] || priorityConfig.medium;

  // Format Due Date
  const formatDueDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const isPast = date < now && !isToday;

    const formatted = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });

    if (isToday) {
      return { text: 'Today', isPast: false, isToday: true, display: formatted };
    }
    return { text: formatted, isPast, isToday: false, display: formatted };
  };

  const dueInfo = formatDueDate(todo.dueDate);

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    if (!todo.isCompleted) {
      // Fire confetti burst
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#6366f1', '#06b6d4', '#10b981'],
        });
      } catch (err) {
        // Safe fallback
      }
    }
    onToggle(todo._id);
  };

  return (
    <div
      className={`glass-card p-3 mb-2.5 transition-all ${
        todo.isCompleted ? 'task-completed' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        borderLeft: todo.isCompleted
          ? '4px solid #10b981'
          : todo.priority === 'urgent'
          ? '4px solid #f43f5e'
          : todo.priority === 'high'
          ? '4px solid #f59e0b'
          : '4px solid rgba(255,255,255,0.1)',
      }}
    >
      <div className="d-flex align-items-start gap-3">
        {/* Custom Checkbox */}
        <div
          className={`custom-checkbox mt-1 ${todo.isCompleted ? 'checked' : ''}`}
          onClick={handleCheckboxClick}
          title={todo.isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
        >
          {todo.isCompleted && <i className="bi bi-check-lg fw-bold" style={{ fontSize: '14px' }}></i>}
        </div>

        {/* Content Body */}
        <div className="flex-grow-1 min-w-0" onClick={() => setExpanded(!expanded)} style={{ cursor: 'pointer' }}>
          {/* Header row: Category, Priority, Due Date */}
          <div className="d-flex flex-wrap align-items-center gap-2 mb-1.5">
            <span className={`badge ${priorityMeta.class} d-inline-flex align-items-center gap-1`} style={{ fontSize: '0.72rem' }}>
              <i className={`bi ${priorityMeta.icon}`}></i> {priorityMeta.label}
            </span>

            {todo.category && (
              <span className="badge badge-category">
                {todo.category}
              </span>
            )}

            {dueInfo && (
              <span
                className={`badge d-inline-flex align-items-center gap-1 font-monospace`}
                style={{
                  fontSize: '0.72rem',
                  backgroundColor: dueInfo.isPast && !todo.isCompleted
                    ? 'rgba(244, 63, 94, 0.15)'
                    : dueInfo.isToday
                    ? 'rgba(245, 158, 11, 0.15)'
                    : 'rgba(255, 255, 255, 0.05)',
                  color: dueInfo.isPast && !todo.isCompleted
                    ? '#fb7185'
                    : dueInfo.isToday
                    ? '#fbbf24'
                    : 'var(--text-secondary)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <i className="bi bi-calendar3"></i>
                {dueInfo.isPast && !todo.isCompleted ? `Overdue (${dueInfo.text})` : dueInfo.text}
              </span>
            )}
          </div>

          {/* Title */}
          <div className="task-title fw-semibold text-white fs-6 mb-1 text-break">
            {todo.title}
          </div>

          {/* Description preview / full */}
          {todo.description && (
            <div
              className="text-secondary small mb-2 text-break"
              style={{
                fontSize: '0.85rem',
                lineHeight: '1.45',
                display: expanded ? 'block' : '-webkit-box',
                WebkitLineClamp: expanded ? 'none' : '2',
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {todo.description}
            </div>
          )}

          {/* Tags */}
          {todo.tags && todo.tags.length > 0 && (
            <div className="d-flex flex-wrap gap-1 mt-1">
              {todo.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="badge bg-black text-muted border border-secondary border-opacity-25"
                  style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)' }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="d-flex align-items-center gap-1 ms-2">
          <button
            className="btn btn-icon btn-dark-outline"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(todo);
            }}
            title="Edit task"
          >
            <i className="bi bi-pencil"></i>
          </button>
          <button
            className="btn btn-icon btn-dark-outline btn-icon-danger"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(todo._id);
            }}
            title="Delete task"
          >
            <i className="bi bi-trash3"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TodoItem;
