const express = require('express');
const { getStats } = require('../controllers/stats');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, authorize('admin'), getStats);

module.exports = router;
