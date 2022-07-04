const Cart = require("../models/cart");

function runUpdate(condition, updateData) {
  return new Promise((resolve, reject) => {
    Cart.findOneAndUpdate(condition, updateData, { upsert: true })
      .then(() => resolve())
      .catch((err) => reject(err));
  });
}

/**
 * Add Item into cart
 */
exports.addItemToCart = (req, res) => {
  Cart.findOne({ user: req.user._id }).exec((error, cart) => {
    if (error) return res.status(400).json({ error });
    if (cart) {
      /* If cart already exists then update cart by quantity */
      let promiseArray = [];

      /* Foreach all product in req */
      req.body.cartItems.forEach((cartItem) => {
        const product = cartItem.product;
        /* Find product equal vs product in req*/
        const item = cart.cartItems.find((c) => c.product == product);
        let condition, update;
        /* Check product req is exist in cart then update cart*/
        if (item) {
          condition = { user: req.user._id, "cartItems.product": product };
          update = { $set: { "cartItems.$": cartItem } };
          /* Check product req is not exist in cart then add product in cart*/
        } else {
          condition = { user: req.user._id };
          update = { $push: { cartItems: cartItem } };
        }
        promiseArray.push(runUpdate(condition, update));
      });
      Promise.all(promiseArray)
        .then((response) => res.status(201).json({ response }))
        .catch((error) => res.status(400).json({ error }));
      /* Case user isn't have cart then create new cart */
    } else {
      const cart = new Cart({
        user: req.user._id,
        cartItems: req.body.cartItems,
      });
      cart.save((error, cart) => {
        if (error) return res.status(400).json({ error });
        if (cart) {
          return res.status(201).json({ cart });
        }
      });
    }
  });
};

/* Get Cartitem of user in database */
exports.getCartItems = (req, res) => {
  Cart.findOne({ user: req.user._id })
    .populate({ path: "cartItems.product", select: "_id name price color productPictures" })
    .exec((error, cart) => {
      if (error) return res.status(400).json({ error });
      if (cart) {
        let cartItems = {};
        cart.cartItems.forEach((item) => {
          cartItems[item.product._id.toString()] = {
            _id: item.product._id.toString(),
            name: item.product.name,
            img: item.product.productPictures[0].img,
            price: item.product.price,
            qty: item.quantity,
            color: item.product.color
          };
        });
        res.status(200).json({ cartItems });
      }
    });
};

/* new update remove cart items */
exports.removeCartItems = (req, res) => {
  const { productId } = req.body.payload;
  if (productId) {
    Cart.updateOne(
      { user: req.user._id },
      {
        $pull: { cartItems: { product: productId } }
      }
    ).exec((error, result) => {
      if (error) return res.status(400).json({ error });
      if (result) {
        res.status(202).json({ result });
      }
    });
  }
};
