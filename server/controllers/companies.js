const Company = require('../models/Company');
const User = require('../models/User');
const Ticket = require('../models/Ticket');

// @desc    Get all companies
// @route   GET /api/companies
// @access  Private/Admin
exports.getCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find();
    
    res.status(200).json({
      success: true,
      count: companies.length,
      data: companies
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single company
// @route   GET /api/companies/:id
// @access  Private/Admin
exports.getCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    
    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'No company found with that id'
      });
    }
    
    res.status(200).json({
      success: true,
      data: company
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create company
// @route   POST /api/companies
// @access  Private/Admin
exports.createCompany = async (req, res, next) => {
  try {
    const company = await Company.create(req.body);
    
    res.status(201).json({
      success: true,
      data: company
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update company
// @route   PUT /api/companies/:id
// @access  Private/Admin
exports.updateCompany = async (req, res, next) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'No company found with that id'
      });
    }
    
    res.status(200).json({
      success: true,
      data: company
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete company
// @route   DELETE /api/companies/:id
// @access  Private/Admin
exports.deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    
    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'No company found with that id'
      });
    }
    
    // Check if there are users or tickets associated with this company
    const associatedUsers = await User.countDocuments({ company: req.params.id });
    const associatedTickets = await Ticket.countDocuments({ company: req.params.id });
    
    if (associatedUsers > 0 || associatedTickets > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete company with associated users or tickets'
      });
    }
    
    await company.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get company users
// @route   GET /api/companies/:id/users
// @access  Private/Admin
exports.getCompanyUsers = async (req, res, next) => {
  try {
    const users = await User.find({ company: req.params.id });
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get company tickets
// @route   GET /api/companies/:id/tickets
// @access  Private/Admin
exports.getCompanyTickets = async (req, res, next) => {
  try {
    // First, get all users belonging to this company
    const companyUsers = await User.find({ company: req.params.id }, '_id');
    
    // Extract just the user IDs into an array
    const userIds = companyUsers.map(user => user._id);
    
    // Find all tickets created by any of these users
    const tickets = await Ticket.find({ createdBy: { $in: userIds } })
      .populate({
        path: 'createdBy',
        select: 'name email'
      })
      .populate({
        path: 'assignedTo',
        select: 'name email'
      })
      .sort('-createdAt'); // Most recent tickets first
    
    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (err) {
    next(err);
  }
};
