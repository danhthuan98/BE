const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["user", "admin", "super-admin"],
      default: "user",
    },
    address: { type: String },
    contactNumber: { type: String },
    profilePicture: { type: String },
    country: { type: String }
  },
  { timestamps: true }
);

userSchema.statics.createCustomer = async function (cust) {
  try {
    const customer = { ...cust, contactNumber: cust.phone }
    await this.create(customer);
  } catch (error) {
    throw error;
  }
}

userSchema.statics.getCustomers = async function (options = {}) {
  try {
    return await this.aggregate([
      { $match: { role: "user" } },
      // { $sort: { createdAt: -1 } },
      { $skip: options.page * options.limit },
      { $limit: options.limit },
    ])
  } catch (error) {
    throw error;
  }
}

userSchema.methods = {
  authenticate: async function (password) {
    return await bcrypt.compare(password, this.hash_password);
  }
};


userSchema.statics.getUserByIds = async function (ids) {
  try {
    const users = await this.find({ _id: { $in: ids } }, 'firstName lastName email');
    return users;
  } catch (error) {
    throw error;
  }
}

module.exports = mongoose.model("User", userSchema);
