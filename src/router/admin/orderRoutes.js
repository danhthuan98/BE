const express = require("express");
const { requireSignin, adminMiddleware } = require("../../common-middlewares");
const { updateOrder, getCustomerOrders, statisticOrderPlaced } = require("../../controller/admin/orderAdmin");
const router = express.Router();

router.post(`/order/update`, requireSignin, adminMiddleware, updateOrder);
router.post(`/order/getCustomerOrders`, requireSignin, adminMiddleware, getCustomerOrders);
router.post(`/order/getQuantityOrder`, requireSignin, adminMiddleware, statisticOrderPlaced);

module.exports = router;
