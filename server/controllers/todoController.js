const Todo = require('../models/Todo');

// @desc    Get all todos for logged in user with search, filter, and sort
// @route   GET /api/todos
// @access  Private
const getTodos = async (req, res, next) => {
  try {
    const { status, priority, category, search, sortBy, sortOrder } = req.query;

    const query = { user: req.user._id };

    // Filter by status (completed / active)
    if (status === 'completed') {
      query.isCompleted = true;
    } else if (status === 'active') {
      query.isCompleted = false;
    }

    // Filter by priority
    if (priority && ['low', 'medium', 'high', 'urgent'].includes(priority)) {
      query.priority = priority;
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Search in title, description, or tags
    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { tags: { $in: [new RegExp(search.trim(), 'i')] } },
      ];
    }

    // Dynamic sorting
    let sortOptions = { createdAt: -1 };
    if (sortBy === 'dueDate') {
      sortOptions = { dueDate: sortOrder === 'desc' ? -1 : 1 };
    } else if (sortBy === 'priority') {
      // Prioritize urgent -> high -> medium -> low in code or standard sort
      sortOptions = { priority: sortOrder === 'desc' ? -1 : 1 };
    } else if (sortBy === 'title') {
      sortOptions = { title: sortOrder === 'desc' ? -1 : 1 };
    } else if (sortBy === 'createdAt') {
      sortOptions = { createdAt: sortOrder === 'asc' ? 1 : -1 };
    }

    const todos = await Todo.find(query).sort(sortOptions);

    res.status(200).json({
      success: true,
      count: todos.length,
      data: todos,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get productivity statistics
// @route   GET /api/todos/stats
// @access  Private
const getTodoStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const total = await Todo.countDocuments({ user: userId });
    const completed = await Todo.countDocuments({ user: userId, isCompleted: true });
    const active = total - completed;

    const urgent = await Todo.countDocuments({ user: userId, priority: 'urgent', isCompleted: false });
    const high = await Todo.countDocuments({ user: userId, priority: 'high', isCompleted: false });
    const medium = await Todo.countDocuments({ user: userId, priority: 'medium', isCompleted: false });
    const low = await Todo.countDocuments({ user: userId, priority: 'low', isCompleted: false });

    // Overdue tasks
    const now = new Date();
    const overdue = await Todo.countDocuments({
      user: userId,
      isCompleted: false,
      dueDate: { $lt: now, $ne: null },
    });

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        total,
        completed,
        active,
        urgent,
        high,
        medium,
        low,
        overdue,
        completionRate,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single todo by ID
// @route   GET /api/todos/:id
// @access  Private
const getTodoById = async (req, res, next) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user._id });

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.status(200).json({
      success: true,
      data: todo,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new todo
// @route   POST /api/todos
// @access  Private
const createTodo = async (req, res, next) => {
  try {
    const { title, description, priority, category, dueDate, tags } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a task title',
      });
    }

    // Process tags array if passed as comma-separated string or array
    let parsedTags = [];
    if (Array.isArray(tags)) {
      parsedTags = tags.map((t) => t.trim()).filter(Boolean);
    } else if (typeof tags === 'string') {
      parsedTags = tags.split(',').map((t) => t.trim()).filter(Boolean);
    }

    const todo = await Todo.create({
      user: req.user._id,
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: priority || 'medium',
      category: category || 'General',
      dueDate: dueDate || null,
      tags: parsedTags,
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: todo,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a todo
// @route   PUT /api/todos/:id
// @access  Private
const updateTodo = async (req, res, next) => {
  try {
    let todo = await Todo.findOne({ _id: req.params.id, user: req.user._id });

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or unauthorized',
      });
    }

    const { title, description, priority, category, dueDate, isCompleted, tags } = req.body;

    if (title !== undefined) todo.title = title.trim();
    if (description !== undefined) todo.description = description.trim();
    if (priority !== undefined) todo.priority = priority;
    if (category !== undefined) todo.category = category;
    if (dueDate !== undefined) todo.dueDate = dueDate ? new Date(dueDate) : null;
    
    if (isCompleted !== undefined) {
      todo.isCompleted = isCompleted;
      todo.completedAt = isCompleted ? new Date() : null;
    }

    if (tags !== undefined) {
      if (Array.isArray(tags)) {
        todo.tags = tags.map((t) => t.trim()).filter(Boolean);
      } else if (typeof tags === 'string') {
        todo.tags = tags.split(',').map((t) => t.trim()).filter(Boolean);
      }
    }

    const updatedTodo = await todo.save();

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTodo,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle todo completion
// @route   PATCH /api/todos/:id/toggle
// @access  Private
const toggleTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user._id });

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or unauthorized',
      });
    }

    todo.isCompleted = !todo.isCompleted;
    todo.completedAt = todo.isCompleted ? new Date() : null;

    const updatedTodo = await todo.save();

    res.status(200).json({
      success: true,
      message: `Task marked as ${updatedTodo.isCompleted ? 'completed' : 'pending'}`,
      data: updatedTodo,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a todo
// @route   DELETE /api/todos/:id
// @access  Private
const deleteTodo = async (req, res, next) => {
  try {
    const todo = await Todo.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or unauthorized',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task removed successfully',
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear all completed todos
// @route   DELETE /api/todos/clear-completed
// @access  Private
const clearCompleted = async (req, res, next) => {
  try {
    const result = await Todo.deleteMany({ user: req.user._id, isCompleted: true });

    res.status(200).json({
      success: true,
      message: `Cleared ${result.deletedCount} completed tasks`,
      data: { deletedCount: result.deletedCount },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTodos,
  getTodoStats,
  getTodoById,
  createTodo,
  updateTodo,
  toggleTodo,
  deleteTodo,
  clearCompleted,
};
