const express = require('express');
const {
  getComments,
  addComment,
  updateComment,
  deleteComment
} = require('../controllers/comments');
const { protect } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(protect, getComments)
  .post(protect, addComment);

router
  .route('/:id')
  .put(protect, updateComment)
  .delete(protect, deleteComment);

module.exports = router;
