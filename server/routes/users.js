const express = require('express');
const router = express.Router();
const { getUsers, getUser, updateUser, updateUserRole } = require('../controllers/users');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Routes
router.route('/')
  .get(authorize('admin'), getUsers);

router.route('/:id')
  .get(authorize('admin'), getUser)
  .put(authorize('admin'), updateUser);

router.route('/:id/role')
  .put(authorize('admin'), updateUserRole);

module.exports = router;
