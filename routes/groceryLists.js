const express = require('express');
const router = express.Router();
const {
  getGroceryList,
  generateGroceryList,
  addGroceryItem,
  updateGroceryItem,
  removeGroceryItem,
  getGroceryLists,
} = require('../controllers/groceryListController');
const { protect } = require('../middleware/auth');

// Protected routes
router.get('/', protect, getGroceryLists);
router.post('/generate', protect, generateGroceryList);
router.get('/:week', protect, getGroceryList);
router.post('/:week/items', protect, addGroceryItem);
router.route('/:week/items/:itemId')
  .put(protect, updateGroceryItem)
  .delete(protect, removeGroceryItem);

module.exports = router;