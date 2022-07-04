const express = require('express');
const router = express.Router();
const { addItemToCart, getCartItems, removeCartItems } = require("../controller/cart");
const { requireSignin, userMiddleware } = require("../common-middlewares/index");


router.post("/user/cart/addtocart", requireSignin, userMiddleware, addItemToCart);

router.post("/user/getCartItems", requireSignin, userMiddleware, getCartItems);
//new update
router.post("/user/cart/removeItem", requireSignin, userMiddleware, removeCartItems);

module.exports = router; 
