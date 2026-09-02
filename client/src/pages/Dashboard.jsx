import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import StatsHeader from '../components/StatsHeader';
import TodoFilter from '../components/TodoFilter';
import TodoItem from '../components/TodoItem';
import TodoModal from '../components/TodoModal';
import ProfileModal from '../components/ProfileModal';
import { todoApi } from '../api/todoApi';

const Dashboard = () => {
  const [todos, setTodos] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting state
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modals state
  const [showTodoModal, setShowTodoModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Fetch todos with debounce search
  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        status: status !== 'all' ? status : undefined,
        priority: priority || undefined,
        category: category || undefined,
        search: search.trim() || undefined,
        sortBy,
        sortOrder,
      };

      const res = await todoApi.getTodos(params);
      if (res.success) {
        setTodos(res.data);
      }
    } catch (err) {
      console.error('Failed to load tasks', err);
      showToast('Error loading tasks from server', 'danger');
    } finally {
      setLoading(false);
    }
  }, [search, status, priority, category, sortBy, sortOrder]);

  // Fetch productivity stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await todoApi.getStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
    fetchStats();
  }, [fetchTodos, fetchStats]);

  // Handlers
  const handleOpenAddModal = () => {
    setEditingTodo(null);
    setShowTodoModal(true);
  };

  const handleOpenEditModal = (todo) => {
    setEditingTodo(todo);
    setShowTodoModal(true);
  };

  const handleSaveTodo = async (todoData) => {
    if (editingTodo) {
      const res = await todoApi.updateTodo(editingTodo._id, todoData);
      if (res.success) {
        showToast('Task updated successfully!', 'success');
      }
    } else {
      const res = await todoApi.createTodo(todoData);
      if (res.success) {
        showToast('New task added to workspace!', 'success');
      }
    }
    fetchTodos();
    fetchStats();
  };

  const handleToggleTodo = async (id) => {
    try {
      // Optimistic update
      setTodos((prev) =>
        prev.map((t) => (t._id === id ? { ...t, isCompleted: !t.isCompleted } : t))
      );
      await todoApi.toggleTodo(id);
      fetchStats();
    } catch (err) {
      showToast('Failed to update task status', 'danger');
      fetchTodos();
    }
  };

  const handleDeleteTodo = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this task?')) return;

    try {
      setTodos((prev) => prev.filter((t) => t._id !== id));
      await todoApi.deleteTodo(id);
      showToast('Task deleted', 'info');
      fetchStats();
    } catch (err) {
      showToast('Failed to delete task', 'danger');
      fetchTodos();
    }
  };

  const handleClearCompleted = async () => {
    if (!window.confirm('Delete all completed tasks in your workspace?')) return;

    try {
      const res = await todoApi.clearCompleted();
      showToast(`Cleared ${res.data?.deletedCount || 0} completed tasks`, 'info');
      fetchTodos();
      fetchStats();
    } catch (err) {
      showToast('Failed to clear completed tasks', 'danger');
    }
  };

  // Quick Seed Demo Starter Tasks if user has 0 tasks
  const handleSeedStarterTasks = async () => {
    try {
      setLoading(true);
      const starterTasks = [
        {
          title: 'Configure Kubernetes Cluster and Ingress Routing',
          description: 'Deploy backend and frontend services using k8s manifests in the k8s/ directory with horizontal pod autoscaling.',
          priority: 'urgent',
          category: 'Work',
          tags: ['k8s', 'devops', 'infrastructure'],
          dueDate: new Date(Date.now() + 86400000).toISOString(),
        },
        {
          title: 'Trigger Multi-Stage Jenkins CI/CD Pipeline',
          description: 'Execute Jenkinsfile automated pipeline stages: Lint, Unit Test, Docker Build & Container Push to Registry.',
          priority: 'high',
          category: 'Work',
          tags: ['jenkins', 'ci-cd', 'docker'],
          dueDate: new Date(Date.now() + 172800000).toISOString(),
        },
        {
          title: 'Test Full Stack MERN REST API Endpoints',
          description: 'Verify JWT auth, todo status toggling, and productivity statistics calculation.',
          priority: 'medium',
          category: 'Study',
          tags: ['mern', 'api', 'testing'],
        },
      ];

      for (const t of starterTasks) {
        await todoApi.createTodo(t);
      }
      showToast('Created 3 starter engineering tasks!', 'success');
      fetchTodos();
      fetchStats();
    } catch (err) {
      showToast('Failed to seed starter tasks', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--bg-pitch-black)' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className="position-fixed top-0 start-50 translate-middle-x mt-4 p-3 animate-fade-in"
          style={{ zIndex: 2000 }}
        >
          <div
            className={`d-flex align-items-center gap-2 px-4 py-2.5 rounded-pill shadow-lg border ${
              toastMessage.type === 'danger'
                ? 'bg-danger text-white border-danger'
                : toastMessage.type === 'success'
                ? 'bg-success text-dark fw-semibold border-success'
                : 'bg-dark text-white border-secondary'
            }`}
            style={{ backdropFilter: 'blur(10px)' }}
          >
            <i
              className={`bi ${
                toastMessage.type === 'danger'
                  ? 'bi-exclamation-triangle-fill'
                  : toastMessage.type === 'success'
                  ? 'bi-check-circle-fill'
                  : 'bi-info-circle-fill'
              }`}
            ></i>
            <span>{toastMessage.message}</span>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        onOpenAddModal={handleOpenAddModal}
        onOpenProfileModal={() => setShowProfileModal(true)}
        stats={stats}
      />

      {/* Main Workspace Container */}
      <main className="container-xl py-4 flex-grow-1">
        {/* Productivity Statistics Cockpit */}
        <StatsHeader
          stats={stats}
          onClearCompleted={handleClearCompleted}
          onOpenAddModal={handleOpenAddModal}
        />

        {/* Filter Controls & Search */}
        <TodoFilter
          search={search}
          setSearch={setSearch}
          status={status}
          setStatus={setStatus}
          category={category}
          setCategory={setCategory}
          priority={priority}
          setPriority={setPriority}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />

        {/* Todo List Area */}
        <div className="todo-list-container">
          {loading && todos.length === 0 ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading tasks...</span>
              </div>
              <p className="text-muted small">Synchronizing workspace tasks...</p>
            </div>
          ) : todos.length === 0 ? (
            /* Empty State */
            <div className="glass-card p-5 text-center animate-fade-in my-3">
              <div
                className="d-inline-flex align-items-center justify-content-center mb-3"
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '20px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)',
                }}
              >
                <i className="bi bi-inbox fs-2"></i>
              </div>
              <h4 className="text-white fw-bold mb-1">No tasks matching your criteria</h4>
              <p className="text-muted small mx-auto mb-4" style={{ maxWidth: '400px' }}>
                {search || status !== 'all' || priority || category
                  ? 'Try clearing your active filters or search terms to see more tasks.'
                  : 'Your workspace is clear. Create your first task or seed sample engineering items to get started.'}
              </p>
              <div className="d-flex justify-content-center gap-2">
                <button onClick={handleOpenAddModal} className="btn btn-accent px-4 py-2">
                  <i className="bi bi-plus-lg me-1"></i> Add Task
                </button>
                {(!stats || stats.total === 0) && (
                  <button onClick={handleSeedStarterTasks} className="btn btn-dark-outline px-3 py-2">
                    <i className="bi bi-lightning me-1"></i> Load Starter Tasks
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Render Tasks */
            <div className="todo-list animate-fade-in">
              {todos.map((todo) => (
                <TodoItem
                  key={todo._id}
                  todo={todo}
                  onToggle={handleToggleTodo}
                  onEdit={handleOpenEditModal}
                  onDelete={handleDeleteTodo}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-top py-3 text-center text-muted small" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="container-xl d-flex flex-column flex-sm-row align-items-center justify-content-between gap-2">
          <div style={{ fontSize: '0.78rem' }}>
            <span className="text-white fw-semibold">OBSIDIAN MERN</span> &copy; {new Date().getFullYear()} — Enterprise Architecture with Docker, Jenkins & K8s
          </div>
          <div className="d-flex align-items-center gap-3" style={{ fontSize: '0.78rem' }}>
            <span className="badge bg-black border border-secondary border-opacity-50 text-cyan">
              <i className="bi bi-circle-fill text-success me-1" style={{ fontSize: '6px' }}></i> API Online
            </span>
          </div>
        </div>
      </footer>

      {/* Add / Edit Task Modal */}
      <TodoModal
        show={showTodoModal}
        onClose={() => setShowTodoModal(false)}
        onSave={handleSaveTodo}
        editingTodo={editingTodo}
      />

      {/* User Profile / Settings Modal */}
      <ProfileModal
        show={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
};

export default Dashboard;
