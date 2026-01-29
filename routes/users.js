const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  getUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getUserStats
} = require('../controllers/userController');

router.route('/').get(protect, admin, getUsers);
router.route('/stats').get(protect, admin, getUserStats);
router.route('/:id').get(protect, admin, getUserById);
router.route('/:id/role').put(protect, admin, updateUserRole);
router.route('/:id').delete(protect, admin, deleteUser);

module.exports = router;