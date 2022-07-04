const express = require('express');
const router = express.Router();
const shortid = require("shortid");
const path = require("path");
const multer = require("multer");
const { addCategory, getCategories, updateCategories, deleteCategories, dragCategory } = require('../controller/category');
const { requireSignin, adminMiddleware } = require('../common-middlewares');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(path.dirname(__dirname), "uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, shortid.generate() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post('/category/create', requireSignin, adminMiddleware, upload.array("categoryImage"), addCategory);
router.get('/category/getcategory', getCategories);
router.post('/category/update', requireSignin, adminMiddleware, upload.array("categoryImage"), updateCategories);
router.post('/category/delete', requireSignin, adminMiddleware, deleteCategories);
router.post('/category/dragdropcategory', requireSignin, adminMiddleware, dragCategory);

module.exports = router;