const address = require("../models/address");
const UserAddress = require("../models/address");

/**
 * function add address
 */
exports.addAddress = (req, res) => {

  const { payload } = req.body;
  if (payload.address) {
    /* Check exists id address */
    if (payload.address._id) {
      /* Find record with user and address._id */
      UserAddress.findOneAndUpdate(
        { user: req.user._id, "address._id": payload.address._id },
        {
          $set: { "address.$": payload.address }
        }
      ).exec((error, address) => {
        if (error) return res.status(400).json({ error });
        if (address) {
          res.status(201).json({ address });
        }
      });
      /* Case not exists address */
    } else {
      /* Add new address with condition user */
      UserAddress.findOneAndUpdate(
        { user: req.user._id },
        {
          $push: { address: payload.address }
        },
        { new: true, upsert: true }
      ).exec((error, address) => {
        if (error) return res.status(400).json({ error });
        if (address) {
          res.status(201).json({ address });
        }
      });
    }
    /** Case Not exists address */
  } else {
    res.status(400).json({ error: "Params address required" });
  }
};

/**
 * Function get all address with conditon user login
 */
exports.getAddress = (req, res) => {

  UserAddress.findOne({ user: req.user._id }).exec((error, userAddress) => {
    if (error) return res.status(400).json({ error });
    if (userAddress) {
      res.status(200).json({ userAddress });
    }
  });
};
