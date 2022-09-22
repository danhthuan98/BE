const express = require("express");
const { requireSignin, adminMiddleware } = require('../common-middlewares');
const { createProduct, getProducts, getProductDetailsById,
    deleteProductById, updateProduct, getProductDetails,
    getProductsByCategoryId, getProductSameType, getProductByColor } = require("../controller/product");
const multer = require("multer");
const router = express.Router();
const shortid = require("shortid");
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(path.dirname(__dirname), "uploads"));
    },
    filename: function (req, file, cb) {
        cb(null, shortid.generate() + "-" + file.originalname);
    },
});

const upload = multer({ storage });

router.post("/product/create", requireSignin, adminMiddleware, upload.array("productPictures"), createProduct);

// router.post("/product/getProducts", getProducts);

router.get("/product/productdetail/:productId", getProductDetailsById);

router.post("/product/getProductDetail", getProductDetails);

router.delete("/product/deleteProductById", requireSignin, adminMiddleware, deleteProductById);

router.post("/product/updateProduct", requireSignin, adminMiddleware, upload.array("productPictures"), updateProduct);

router.get("/product/category/:categoryId", getProductsByCategoryId);

router.post("/product/category/:categoryId", getProductsByCategoryId);

router.post("/product/getProductSameType", getProductSameType);

router.post("/product/getProductByColor", getProductByColor);

/* Code new */

router.get('/product/getproducts', getProducts);

module.exports = router;