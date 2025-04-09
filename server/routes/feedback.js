const express = require('express');
const { submitFeedback, getFeedbackStats } = require('../controllers/feedback');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.route('/')
  .post(protect, submitFeedback);

router.route('/stats')
  .get(protect, authorize('admin'), getFeedbackStats);

module.exports = router;
