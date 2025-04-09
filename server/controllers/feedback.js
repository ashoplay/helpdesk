const Ticket = require('../models/Ticket');

// @desc    Submit feedback for a resolved ticket
// @route   POST /api/tickets/:id/feedback
// @access  Private
exports.submitFeedback = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a rating between 1 and 5'
      });
    }

    let ticket = await Ticket.findById(req.params.id);

    // Check if ticket exists
    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    // Check if user owns the ticket
    if (ticket.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to submit feedback for this ticket'
      });
    }

    // Check if ticket is resolved
    if (ticket.status !== 'Løst') {
      return res.status(400).json({
        success: false,
        error: 'Cannot submit feedback for unresolved tickets'
      });
    }

    // Add feedback
    ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      {
        feedback: {
          rating,
          comment,
          submittedAt: Date.now()
        }
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get feedback statistics
// @route   GET /api/feedback/stats
// @access  Private/Admin
exports.getFeedbackStats = async (req, res, next) => {
  try {
    // Get average rating by assigned role
    const roleRatings = await Ticket.aggregate([
      {
        $match: { 
          'feedback.rating': { $exists: true } 
        }
      },
      {
        $group: {
          _id: '$assignedToRole',
          averageRating: { $avg: '$feedback.rating' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: roleRatings
    });
  } catch (err) {
    next(err);
  }
};
