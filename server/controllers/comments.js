const Comment = require('../models/Comment');
const Ticket = require('../models/Ticket');

// @desc    Get comments for a ticket
// @route   GET /api/tickets/:ticketId/comments
// @access  Private
exports.getComments = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'No ticket found with that id'
      });
    }

    // Make sure only ticket creator or admin can view comments
    if (ticket.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access comments for this ticket'
      });
    }

    const comments = await Comment.find({ ticket: req.params.ticketId })
      .populate({
        path: 'user',
        select: 'name role'
      })
      .sort('createdAt');

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add comment to ticket
// @route   POST /api/tickets/:ticketId/comments
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    req.body.ticket = req.params.ticketId;
    req.body.user = req.user.id;

    const ticket = await Ticket.findById(req.params.ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'No ticket found with that id'
      });
    }

    // Make sure only ticket creator or admin can add comments
    if (ticket.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to add comments to this ticket'
      });
    }

    const comment = await Comment.create(req.body);

    // Populate user details before sending via socket
    const populatedComment = await Comment.findById(comment._id).populate({
      path: 'user',
      select: 'name role'
    });

    // Get io instance from app and emit event to ticket room
    const io = req.app.get('io');
    io.to(`ticket-${req.params.ticketId}`).emit('newComment', populatedComment);

    // Update ticket's updatedAt field
    await Ticket.findByIdAndUpdate(req.params.ticketId, { 
      updatedAt: Date.now() 
    });

    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private
exports.updateComment = async (req, res, next) => {
  try {
    let comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'No comment found with that id'
      });
    }

    // Make sure comment belongs to user or user is admin
    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this comment'
      });
    }

    comment = await Comment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: comment
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'No comment found with that id'
      });
    }

    // Make sure comment belongs to user or user is admin
    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this comment'
      });
    }

    await comment.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};
