const Ticket = require('../models/Ticket');

// @desc    Get all tickets
// @route   GET /api/tickets
// @access  Private
exports.getTickets = async (req, res, next) => {
  try {
    let query;
    
    // If user is an admin, get all tickets
    // If user is not admin, only get their tickets
    if (req.user.role === 'admin') {
      query = Ticket.find().populate({
        path: 'createdBy',
        select: 'name email'
      }).populate({
        path: 'assignedTo',
        select: 'name email'
      });
    } else {
      query = Ticket.find({ createdBy: req.user.id }).populate({
        path: 'assignedTo',
        select: 'name email'
      });
    }

    // Add sort functionality
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt'); // Default sort by date descending
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Ticket.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // Execute query
    const tickets = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: tickets.length,
      pagination,
      data: tickets
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private
exports.getTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate({
        path: 'createdBy',
        select: 'name email'
      })
      .populate({
        path: 'assignedTo',
        select: 'name email'
      });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'No ticket found with that id'
      });
    }

    // Allow creator, admin, and support staff to access tickets
    const supportRoles = ['1. linje', '2. linje', 'admin'];
    if (ticket.createdBy._id.toString() !== req.user.id && 
        !supportRoles.includes(req.user.role) &&
        ticket.assignedToRole !== req.user.role) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this ticket'
      });
    }

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new ticket
// @route   POST /api/tickets
// @access  Private
exports.createTicket = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.createdBy = req.user.id;
    
    const ticket = await Ticket.create(req.body);

    res.status(201).json({
      success: true,
      data: ticket
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update ticket
// @route   PUT /api/tickets/:id
// @access  Private
exports.updateTicket = async (req, res, next) => {
  try {
    let ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'No ticket found with that id'
      });
    }

    // Allow creator, admin, and appropriate support staff to update tickets
    const canUpdateStatus = ['1. linje', '2. linje', 'admin'].includes(req.user.role);
    const is2ndLine = ['2. linje', 'admin'].includes(req.user.role);
    
    if (ticket.createdBy.toString() !== req.user.id && !canUpdateStatus) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this ticket'
      });
    }

    // Restrict certain actions for 1. linje
    if (req.user.role === '1. linje') {
      // 1. linje can update status and add comments, but not change priority
      if (req.body.priority && req.body.priority !== ticket.priority) {
        return res.status(403).json({
          success: false,
          error: '1. linje support cannot change ticket priority'
        });
      }
    }

    // Track history changes
    const history = [];
    
    if (req.body.status && req.body.status !== ticket.status) {
      history.push({
        field: 'status',
        oldValue: ticket.status,
        newValue: req.body.status,
        updatedBy: req.user.id,
        updatedAt: Date.now()
      });
    }
    
    if (req.body.priority && req.body.priority !== ticket.priority) {
      history.push({
        field: 'priority',
        oldValue: ticket.priority,
        newValue: req.body.priority,
        updatedBy: req.user.id,
        updatedAt: Date.now()
      });
    }
    
    if (history.length > 0) {
      req.body.history = [...ticket.history, ...history];
    }

    ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete ticket
// @route   DELETE /api/tickets/:id
// @access  Private
exports.deleteTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'No ticket found with that id'
      });
    }

    // Make sure only creator or admin can delete ticket
    if (ticket.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this ticket'
      });
    }

    await ticket.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Assign ticket to role
// @route   PUT /api/tickets/:id/assign
// @access  Private/Admin
exports.assignTicket = async (req, res, next) => {
  try {
    const { role } = req.body;
    
    if (!role || !['1. linje', '2. linje'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid role'
      });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { assignedToRole: role },
      { new: true, runValidators: true }
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'No ticket found with that id'
      });
    }

    // Add to history
    ticket.history.push({
      field: 'assignedToRole',
      oldValue: 'unassigned',
      newValue: role,
      updatedBy: req.user.id,
      updatedAt: Date.now()
    });

    await ticket.save();

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get tickets by role
// @route   GET /api/tickets/role/:role
// @access  Private
exports.getTicketsByRole = async (req, res, next) => {
  try {
    // Check if user has the role they're trying to access
    if (req.user.role !== req.params.role && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view these tickets'
      });
    }

    const tickets = await Ticket.find({ assignedToRole: req.params.role })
      .populate({
        path: 'createdBy',
        select: 'name email'
      });

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get ticket statistics by role
// @route   GET /api/tickets/stats/roles
// @access  Private/Admin
exports.getRoleStats = async (req, res, next) => {
  try {
    const roleStats = await Ticket.aggregate([
      {
        $group: {
          _id: {
            role: '$assignedToRole',
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.role',
          statuses: {
            $push: {
              status: '$_id.status',
              count: '$count'
            }
          },
          totalTickets: { $sum: '$count' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: roleStats
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete ticket (admin only, must be resolved)
// @route   DELETE /api/tickets/:id
// @access  Private/Admin
exports.deleteTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'No ticket found with that id'
      });
    }

    // Only admin can delete tickets
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete tickets'
      });
    }

    // Only resolved tickets can be deleted
    if (ticket.status !== 'Løst') {
      return res.status(400).json({
        success: false,
        error: 'Only resolved tickets can be deleted'
      });
    }

    await ticket.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update ticket priority
// @route   PUT /api/tickets/:id/priority
// @access  Private/Admin/Support
exports.updateTicketPriority = async (req, res, next) => {
  try {
    const { priority } = req.body;
    
    if (!priority) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a priority'
      });
    }
    
    let ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'No ticket found with that id'
      });
    }
    
    // Add to history if priority changed
    if (priority !== ticket.priority) {
      const historyEntry = {
        field: 'priority',
        oldValue: ticket.priority,
        newValue: priority,
        updatedBy: req.user.id,
        updatedAt: Date.now()
      };
      
      // Update the ticket
      ticket = await Ticket.findByIdAndUpdate(
        req.params.id, 
        { 
          priority,
          $push: { history: historyEntry }
        },
        { new: true, runValidators: true }
      );
      
      // Emit socket event if available
      if (req.app.get('io')) {
        req.app.get('io').to(`ticket-${ticket._id}`).emit('ticketUpdated', ticket);
      }
    }
    
    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (err) {
    next(err);
  }
};
