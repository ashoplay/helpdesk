const Ticket = require('../models/Ticket');
const User = require('../models/User');

// @desc    Get ticket statistics
// @route   GET /api/stats
// @access  Private/Admin
exports.getStats = async (req, res, next) => {
  try {
    // Count tickets by status
    const statusCounts = await Ticket.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert to user-friendly format
    const statusStats = {
      'Åpen': 0,
      'Under arbeid': 0,
      'Løst': 0
    };
    
    statusCounts.forEach(status => {
      statusStats[status._id] = status.count;
    });

    // Count tickets by priority
    const priorityCounts = await Ticket.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert to user-friendly format
    const priorityStats = {
      'Lav': 0,
      'Medium': 0,
      'Høy': 0
    };
    
    priorityCounts.forEach(priority => {
      priorityStats[priority._id] = priority.count;
    });
    
    // Count tickets by category
    const categoryCounts = await Ticket.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent tickets
    const recentTickets = await Ticket.find()
      .sort('-createdAt')
      .limit(5)
      .populate({
        path: 'createdBy',
        select: 'name'
      });

    // User counts
    const userCount = await User.countDocuments({ role: 'user' });
    const adminCount = await User.countDocuments({ role: 'admin' });

    res.status(200).json({
      success: true,
      data: {
        statusStats,
        priorityStats,
        categoryCounts,
        recentTickets,
        userCount,
        adminCount
      }
    });
  } catch (err) {
    next(err);
  }
};
