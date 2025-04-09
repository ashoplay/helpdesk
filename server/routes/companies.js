const express = require('express');
const {
  getCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
  getCompanyUsers,
  getCompanyTickets
} = require('../controllers/companies');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require admin privilege
router.use(protect);
router.use(authorize('admin'));

router
  .route('/')
  .get(getCompanies)
  .post(createCompany);

router
  .route('/:id')
  .get(getCompany)
  .put(updateCompany)
  .delete(deleteCompany);

router.get('/:id/users', getCompanyUsers);
router.get('/:id/tickets', getCompanyTickets);

module.exports = router;
