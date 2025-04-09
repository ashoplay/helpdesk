const express = require('express');
const { 
  getTickets, 
  getTicket, 
  createTicket, 
  updateTicket, 
  deleteTicket,
  assignTicket,
  getTicketsByRole,
  getRoleStats,
  updateTicketPriority
} = require('../controllers/tickets');
const { protect, authorize, canUpdatePriority } = require('../middleware/auth');

// Include comment and feedback routers
const commentRouter = require('./comments');
const feedbackRouter = require('./feedback');

const router = express.Router();

// Re-route into other resource routers
router.use('/:ticketId/comments', commentRouter);
router.use('/:ticketId/feedback', feedbackRouter);

// Get tickets by role
router.route('/role/:role').get(protect, getTicketsByRole);

// Get role statistics
router.route('/stats/roles').get(protect, authorize('admin'), getRoleStats);

// Assign ticket to role
router.route('/:id/assign').put(protect, authorize('admin'), assignTicket);

// Add a dedicated route for priority updates
router.route('/:id/priority')
  .put(protect, canUpdatePriority, updateTicketPriority);

router
  .route('/')
  .get(protect, getTickets)
  .post(protect, createTicket);

router
  .route('/:id')
  .get(protect, getTicket)
  .put(protect, updateTicket)
  .delete(protect, authorize('admin'), deleteTicket);

module.exports = router;
